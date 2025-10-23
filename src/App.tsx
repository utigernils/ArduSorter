import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ControlPanel from './components/ControlPanel';
import WebcamView from './components/WebcamView';
import PredictionPanel from './components/PredictionPanel';
import SerialLog from './components/SerialLog';
import { useSerialConnection } from './hooks/useSerialConnection';
import { useModelInference, Prediction } from './hooks/useModelInference';

function App() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [currentPredictions, setCurrentPredictions] = useState<Prediction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [classToCommandMapping, setClassToCommandMapping] = useState<Record<string, string>>({});
  const classificationIntervalRef = useRef<number | null>(null);

  const {
    status: serialStatus,
    messages: serialMessages,
    connect: connectSerial,
    disconnect: disconnectSerial,
    sendMessage,
  } = useSerialConnection();

  const {
    modelLoaded,
    isLoading: modelLoading,
    loadModelFromFiles,
    predict,
  } = useModelInference();

  const handleVideoRef = useCallback((ref: HTMLVideoElement | null) => {
    setVideoElement(ref);
  }, []);

  const handleLoadModelFromFiles = useCallback(
    async (files: File[], labels: string[]) => {
      await loadModelFromFiles(files, labels);
    },
    [loadModelFromFiles]
  );

  const handleClassMappingChange = useCallback((mapping: Record<string, string>) => {
    setClassToCommandMapping(mapping);
  }, []);



  const runClassification = useCallback(async () => {
    if (!videoElement || !modelLoaded || !isClassifying) return;

    try {
      setIsProcessing(true);
      const predictions = await predict(videoElement);
      setCurrentPredictions(predictions);

      if (predictions.length > 0 && serialStatus === 'connected') {
        const topPrediction = predictions[0];
        const command = classToCommandMapping[topPrediction.className] || topPrediction.classIndex.toString();
        await sendMessage(command);
      }
    } catch (error) {
      console.error('Classification error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [videoElement, modelLoaded, isClassifying, predict, serialStatus, sendMessage, classToCommandMapping]);

  useEffect(() => {
    if (isClassifying && modelLoaded && videoElement) {
      classificationIntervalRef.current = window.setInterval(() => {
        runClassification();
      }, 1000);
    } else {
      if (classificationIntervalRef.current) {
        clearInterval(classificationIntervalRef.current);
        classificationIntervalRef.current = null;
      }
    }

    return () => {
      if (classificationIntervalRef.current) {
        clearInterval(classificationIntervalRef.current);
      }
    };
  }, [isClassifying, modelLoaded, videoElement, runClassification]);

  const handleStartClassification = useCallback(() => {
    if (!modelLoaded) {
      alert('Please load a model first');
      return;
    }
    setIsClassifying(true);
  }, [modelLoaded]);

  const handleStopClassification = useCallback(() => {
    setIsClassifying(false);
    setCurrentPredictions([]);
  }, []);

  return (
    <div className="min-h-screen bg-suva-grey flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel
              serialStatus={serialStatus}
              modelLoaded={modelLoaded}
              isClassifying={isClassifying}
              isModelLoading={modelLoading}
              onConnectArduino={connectSerial}
              onDisconnectArduino={disconnectSerial}
              onLoadModelFromFiles={handleLoadModelFromFiles}
              onStartClassification={handleStartClassification}
              onStopClassification={handleStopClassification}
              onSendCommand={sendMessage}
              onClassMappingChange={handleClassMappingChange}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <WebcamView onVideoRef={handleVideoRef} isActive={isClassifying} />

            <PredictionPanel
              predictions={currentPredictions}
              isProcessing={isProcessing}
            />

            <SerialLog messages={serialMessages} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
