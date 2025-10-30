import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

export interface Prediction {
  className: string;
  probability: number;
  classIndex: number;
}

export function useModelInference() {
  const [model, setModel] = useState<tf.GraphModel | tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [classLabels, setClassLabels] = useState<string[]>([]);

  const loadModelFromFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    try {
      await tf.ready();

      // Find required files
      const modelJsonFile = files.find(f => f.name === 'model.json');
      const metadataJsonFile = files.find(f => f.name === 'metadata.json');
      
      if (!modelJsonFile) {
        throw new Error('model.json file is required');
      }
      
      if (!metadataJsonFile) {
        throw new Error('metadata.json file is required');
      }

      const weightsFiles = files.filter(f => f.name.includes('.bin') || f.name.includes('shard'));

      // Parse metadata.json to extract labels
      const metadataJson = JSON.parse(await metadataJsonFile.text());
      
      if (!metadataJson.labels || !Array.isArray(metadataJson.labels)) {
        throw new Error('metadata.json must contain a "labels" array');
      }

      const extractedLabels = metadataJson.labels;
      setClassLabels(extractedLabels);

      // Load the model
      const modelJson = JSON.parse(await modelJsonFile.text());

      let loadedModel: tf.GraphModel | tf.LayersModel;

      if (modelJson.format === 'graph-model' || modelJson.modelTopology?.node) {
        loadedModel = await tf.loadGraphModel(tf.io.browserFiles([modelJsonFile, ...weightsFiles]));
      } else {
        loadedModel = await tf.loadLayersModel(tf.io.browserFiles([modelJsonFile, ...weightsFiles]));
      }

      setModel(loadedModel);
      setModelLoaded(true);
    } catch (error) {
      console.error('Model loading error:', error);
      if (error instanceof Error) {
        alert(`Failed to load model: ${error.message}`);
      } else {
        alert('Failed to load model files. Please ensure you have selected all necessary files (model.json, metadata.json, and weights).');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);



  const predict = useCallback(
    async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Prediction[]> => {
      if (!model) {
        throw new Error('Model not loaded');
      }

      const predArray = tf.tidy(() => {
        let tensor = tf.browser.fromPixels(imageElement);

        if (tensor.shape[0] !== 224 || tensor.shape[1] !== 224) {
          tensor = tf.image.resizeBilinear(tensor, [224, 224]);
        }

        tensor = tensor.expandDims(0);
        tensor = tensor.toFloat().div(255.0);

        const predictions = model.predict(tensor) as tf.Tensor;
        return predictions.dataSync();
      });

      const results: Prediction[] = Array.from(predArray)
        .map((probability, index) => ({
          className: classLabels[index] || `Class ${index}`,
          probability: probability as number,
          classIndex: index,
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

      return results;
    },
    [model, classLabels]
  );

  return {
    model,
    isLoading,
    modelLoaded,
    classLabels,
    loadModelFromFiles,
    predict,
  };
}
