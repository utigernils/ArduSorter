import { Usb, Upload, Play, Square, Send, FileUp } from 'lucide-react';
import { useState, useRef } from 'react';
import StatusIndicator from './StatusIndicator';
import { ConnectionStatus } from '../hooks/useSerialConnection';

interface ControlPanelProps {
  serialStatus: ConnectionStatus;
  modelLoaded: boolean;
  isClassifying: boolean;
  isModelLoading: boolean;
  onConnectArduino: () => void;
  onDisconnectArduino: () => void;
  onLoadModelFromFiles: (files: File[], labels: string[]) => void;
  onStartClassification: () => void;
  onStopClassification: () => void;
  onSendCommand: (command: string) => void;
  onClassMappingChange: (mapping: Record<string, string>) => void;
}

export default function ControlPanel({
  serialStatus,
  modelLoaded,
  isClassifying,
  isModelLoading,
  onConnectArduino,
  onDisconnectArduino,
  onLoadModelFromFiles,
  onStartClassification,
  onStopClassification,
  onSendCommand,
  onClassMappingChange,
}: ControlPanelProps) {
  const [classLabels, setClassLabels] = useState('red,green,nothing');
  const [customCommand, setCustomCommand] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [classToCommandMapping, setClassToCommandMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const labels = classLabels.split(',').map(l => l.trim()).filter(l => l);
    onLoadModelFromFiles(selectedFiles, labels);
    
    const defaultMapping: Record<string, string> = {};
    labels.forEach((label, index) => {
      defaultMapping[label] = index.toString();
    });
    setClassToCommandMapping(defaultMapping);
    onClassMappingChange(defaultMapping);
  };

  const handleClassLabelsChange = (newLabels: string) => {
    setClassLabels(newLabels);
    
    const labels = newLabels.split(',').map(l => l.trim()).filter(l => l);
    const newMapping: Record<string, string> = {};
    labels.forEach((label, index) => {
      newMapping[label] = classToCommandMapping[label] || index.toString();
    });
    setClassToCommandMapping(newMapping);
    onClassMappingChange(newMapping);
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
                Select Model Files (model.weights.bin & model.json)
              </label>
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Class Labels (comma-separated)
              </label>
              <input
                type="text"
                value={classLabels}
                onChange={(e) => handleClassLabelsChange(e.target.value)}
                placeholder="plastic,metal,paper,glass"
                className="w-full px-3 py-2 border border-suva-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-suva-blue"
                disabled={modelLoaded}
              />
            </div>
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
