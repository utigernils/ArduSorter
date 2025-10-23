import { useEffect } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';

interface WebcamViewProps {
  onVideoRef: (ref: HTMLVideoElement | null) => void;
  isActive: boolean;
}

export default function WebcamView({ onVideoRef, isActive }: WebcamViewProps) {
  const { videoRef, isStreaming, error, startWebcam, stopWebcam } = useWebcam();

  useEffect(() => {
    if (videoRef.current) {
      onVideoRef(videoRef.current);
    }
  }, [videoRef.current, onVideoRef]);

  useEffect(() => {
    if (isActive && !isStreaming) {
      startWebcam();
    } else if (!isActive && isStreaming) {
      stopWebcam();
    }
  }, [isActive, isStreaming, startWebcam, stopWebcam]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-suva-border overflow-hidden">
      <div className="px-6 py-4 border-b border-suva-border flex items-center justify-between">
        <h3 className="font-semibold text-suva-dark">Live Feed</h3>
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <>
              <Camera className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Active</span>
            </>
          ) : (
            <>
              <CameraOff className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Inactive</span>
            </>
          )}
        </div>
      </div>

      <div className="relative bg-gray-900 aspect-video">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <CameraOff className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        ) : !isStreaming ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Camera feed will appear here</p>
            </div>
          </div>
        ) : null}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
      </div>
    </div>
  );
}
