import { useState, useCallback, useEffect } from 'react';
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
  const [isTensorFlowLoading, setIsTensorFlowLoading] = useState(false);
  const [classToCommandMapping, setClassToCommandMapping] = useState<Record<string, string>>({});
  const [classificationDelay, setClassificationDelay] = useState(1000); // Default 1 second delay

  const {
    status: serialStatus,
    messages: serialMessages,
    connect: connectSerial,
    disconnect: disconnectSerial,
    sendMessage,
    addMessage,
  } = useSerialConnection();

  const {
    modelLoaded,
    isLoading: modelLoading,
    classLabels: extractedClassLabels,
    loadModelFromFiles,
    predict,
  } = useModelInference();

  const handleVideoRef = useCallback((ref: HTMLVideoElement | null) => {
    setVideoElement(ref);
  }, []);

  const handleLoadModelFromFiles = useCallback(
    async (files: File[]) => {
      await loadModelFromFiles(files);
    },
    [loadModelFromFiles]
  );

  const handleClassMappingChange = useCallback((mapping: Record<string, string>) => {
    setClassToCommandMapping(mapping);
  }, []);

  const handleDelayChange = useCallback((delay: number) => {
    setClassificationDelay(delay);
  }, []);

  const checkVideoStream = useCallback(() => {
    if (videoElement && videoElement.readyState >= 2) {
      return true;
    }
    return false;
  }, [videoElement]);

  const runClassification = useCallback(async () => {
    if (!videoElement || !modelLoaded) return;

    if(!checkVideoStream()) {
      setIsTensorFlowLoading(true);
      addMessage('system', 'Waiting for video stream...');
      await new Promise<void>((resolve) => {
        const intervalId = setInterval(() => {
          if (checkVideoStream()) {
            clearInterval(intervalId);
            setIsTensorFlowLoading(false);
            resolve();
          }
        }, 100);
      });
    }

    try {
      setIsProcessing(true);
      addMessage('system', 'Running classification...');
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
  }, [videoElement, modelLoaded, predict, serialStatus, sendMessage, classToCommandMapping, addMessage, checkVideoStream]);

  useEffect(() => {
    if (!isClassifying) {
      setCurrentPredictions([]);
    }
  }, [isClassifying]);

  useEffect(() => {
    if (isClassifying && serialMessages.length > 0) {
      const lastMessage = serialMessages[serialMessages.length - 1];
      if (lastMessage.data.includes('Action done.')) {
        setTimeout(() => {
          runClassification();
        }, classificationDelay);
      }
    }
  }, [serialMessages, isClassifying, runClassification, classificationDelay]);

  const handleStartClassification = useCallback(() => {
    if (!modelLoaded) {
      alert('Please load a model first');
      return;
    }
    setIsClassifying(true);
    runClassification();
    addMessage('system', 'Sorting started.');
  }, [modelLoaded, runClassification]);

  const handleStopClassification = useCallback(() => {
    setIsClassifying(false);
    setCurrentPredictions([]);
    addMessage('system', 'Sorting stopped.');
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
              extractedClassLabels={extractedClassLabels}
              classificationDelay={classificationDelay}
              onConnectArduino={connectSerial}
              onDisconnectArduino={disconnectSerial}
              onLoadModelFromFiles={handleLoadModelFromFiles}
              onStartClassification={handleStartClassification}
              onStopClassification={handleStopClassification}
              onSendCommand={sendMessage}
              onClassMappingChange={handleClassMappingChange}
              onDelayChange={handleDelayChange}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <WebcamView 
              onVideoRef={handleVideoRef} 
              isActive={isClassifying}
              isTensorFlowLoading={isTensorFlowLoading}
            />

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
