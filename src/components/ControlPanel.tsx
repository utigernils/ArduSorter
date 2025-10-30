import { Usb, Upload, Play, Square, Send, FileUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';
import { ConnectionStatus } from '../hooks/useSerialConnection';

interface ControlPanelProps {
  serialStatus: ConnectionStatus;
  modelLoaded: boolean;
  isClassifying: boolean;
  isModelLoading: boolean;
  extractedClassLabels: string[];
  classificationDelay: number;
  onConnectArduino: () => void;
  onDisconnectArduino: () => void;
  onLoadModelFromFiles: (files: File[]) => void;
  onStartClassification: () => void;
  onStopClassification: () => void;
  onSendCommand: (command: string) => void;
  onClassMappingChange: (mapping: Record<string, string>) => void;
  onDelayChange: (delay: number) => void;
}

export default function ControlPanel({
  serialStatus,
  modelLoaded,
  isClassifying,
  isModelLoading,
  extractedClassLabels,
  classificationDelay,
  onConnectArduino,
  onDisconnectArduino,
  onLoadModelFromFiles,
  onStartClassification,
  onStopClassification,
  onSendCommand,
  onClassMappingChange,
  onDelayChange,
}: ControlPanelProps) {
  const [customCommand, setCustomCommand] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [classToCommandMapping, setClassToCommandMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update class labels when extracted from metadata.json
  useEffect(() => {
    if (extractedClassLabels.length > 0) {
      // Update command mapping with extracted labels
      const newMapping: Record<string, string> = {};
      extractedClassLabels.forEach((label, index) => {
        newMapping[label] = index.toString();
      });
      setClassToCommandMapping(newMapping);
      onClassMappingChange(newMapping);
    }
  }, [extractedClassLabels, onClassMappingChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleLoadFromFiles = () => {
    if (selectedFiles.length === 0) {
      alert('Please select model files');
      return;
    }
    
    // Check if metadata.json is included
    const hasMetadata = selectedFiles.some(f => f.name === 'metadata.json');
    const hasModel = selectedFiles.some(f => f.name === 'model.json');
    
    if (!hasMetadata) {
      alert('metadata.json file is required. Please include it in your selection.');
      return;
    }
    
    if (!hasModel) {
      alert('model.json file is required. Please include it in your selection.');
      return;
    }
    
    onLoadModelFromFiles(selectedFiles);
  };

  const handleCommandMappingChange = (className: string, command: string) => {
    const newMapping = { ...classToCommandMapping, [className]: command };
    setClassToCommandMapping(newMapping);
    onClassMappingChange(newMapping);
  };



  const handleSendCommand = () => {
    if (customCommand.trim()) {
      onSendCommand(customCommand);
      setCustomCommand('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-suva-border overflow-hidden">
      <div className="px-6 py-4 border-b border-suva-border">
        <h3 className="font-semibold text-suva-dark">Control Panel</h3>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <StatusIndicator status={serialStatus} label="Arduino Connection" />
          </div>
          {serialStatus === 'disconnected' ? (
            <button
              onClick={onConnectArduino}
              className="w-full bg-suva-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Usb className="w-5 h-5" />
              Connect Arduino
            </button>
          ) : (
            <button
              onClick={onDisconnectArduino}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="border-t border-suva-border pt-6">
          <h4 className="text-sm font-semibold text-suva-dark mb-3">
            TensorFlow.js Model
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Select Model Files (model.json, model.weights.bin & metadata.json)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                <strong>Required:</strong> metadata.json (contains class labels), model.json, and weight files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json,.bin"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={modelLoaded}
                className="w-full px-3 py-2.5 border-2 border-dashed border-suva-border rounded-lg text-sm text-gray-600 hover:border-suva-blue hover:text-suva-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileUp className="w-4 h-4 mx-auto mb-1" />
                {selectedFiles.length === 0
                  ? 'Click to select files'
                  : `${selectedFiles.length} file(s) selected`}
              </button>
              {selectedFiles.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {selectedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
            {extractedClassLabels.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-medium text-green-700 mb-1">
                  ✓ Labels extracted from metadata.json:
                </p>
                <p className="text-xs text-green-600">
                  {extractedClassLabels.join(', ')}
                </p>
              </div>
            )}
            <button
              onClick={handleLoadFromFiles}
              disabled={modelLoaded || isModelLoading || selectedFiles.length === 0}
              className={`w-full px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                modelLoaded
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-suva-blue text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              {isModelLoading ? 'Loading...' : modelLoaded ? 'Model Loaded' : 'Load Model'}
            </button>
          </div>
        </div>

        {modelLoaded && Object.keys(classToCommandMapping).length > 0 && (
          <div className="border-t border-suva-border pt-6">
            <h4 className="text-sm font-semibold text-suva-dark mb-3">
              Class to Command Mapping
            </h4>
            <div className="space-y-2">
              {Object.entries(classToCommandMapping).map(([className, command]) => (
                <div key={className} className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600 w-20 text-left">
                    {className}:
                  </label>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => handleCommandMappingChange(className, e.target.value)}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-suva-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-suva-blue"
                  />
                  <span className="text-xs text-gray-500 w-16 text-right">
                    → Arduino
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Configure which serial command (number) to send for each detected class.
            </p>
          </div>
        )}

        <div className="border-t border-suva-border pt-6">
          <h4 className="text-sm font-semibold text-suva-dark mb-3">
            Classification Control
          </h4>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Delay after "Action done." (ms): {classificationDelay}ms
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={classificationDelay}
              onChange={(e) => onDelayChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-suva-blue"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0ms</span>
              <span>2.5s</span>
              <span>5s</span>
            </div>
          </div>
          {!isClassifying ? (
            <button
              onClick={onStartClassification}
              disabled={!modelLoaded}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Start Sorting
            </button>
          ) : (
            <button
              onClick={onStopClassification}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Square className="w-5 h-5" />
              Stop Sorting
            </button>
          )}
        </div>

        <div className="border-t border-suva-border pt-6">
          <h4 className="text-sm font-semibold text-suva-dark mb-3">
            Manual Commands
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
              placeholder="Enter command (e.g., 0, 1, 2)"
              className="flex-1 px-3 py-2 border border-suva-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-suva-blue"
              disabled={serialStatus !== 'connected'}
            />
            <button
              onClick={handleSendCommand}
              disabled={serialStatus !== 'connected'}
              className="bg-suva-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
