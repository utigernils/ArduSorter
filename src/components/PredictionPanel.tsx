import { Prediction } from '../hooks/useModelInference';

interface PredictionPanelProps {
  predictions: Prediction[];
  isProcessing: boolean;
}

export default function PredictionPanel({ predictions, isProcessing }: PredictionPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-suva-border overflow-hidden">
      <div className="px-6 py-4 border-b border-suva-border">
        <h3 className="font-semibold text-suva-dark">Classification Results</h3>
      </div>

      <div className="p-6">
        {!predictions.length && !isProcessing && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Start classification to see results
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        )}

        {predictions.length > 0 && !isProcessing && (
          <div className="space-y-4">
            {predictions.map((pred, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    index === 0 ? 'text-suva-dark' : 'text-gray-600'
                  }`}>
                    {pred.className}
                  </span>
                  <span className={`text-sm font-semibold ${
                    index === 0 ? 'text-suva-blue' : 'text-gray-500'
                  }`}>
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-suva-blue' : 'bg-gray-400'
                    }`}
                    style={{ width: `${pred.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
