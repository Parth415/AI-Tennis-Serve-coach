
import React, { useRef, useEffect } from 'react';
import { SwitchCameraIcon } from '../icons/SwitchCameraIcon';

interface LiveFeedProps {
  stream: MediaStream | null;
  onSwitchCamera: () => void;
  isSessionActive: boolean;
  facingMode: 'user' | 'environment';
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ stream, onSwitchCamera, isSessionActive, facingMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full flex-grow bg-black rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
      />
      {!stream && <p className="text-white">Waiting for camera access...</p>}
      {stream && (
        <button
            onClick={onSwitchCamera}
            disabled={isSessionActive}
            className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-50 hover:bg-opacity-75 disabled:bg-opacity-25 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Switch camera"
            title="Switch camera"
        >
            <SwitchCameraIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
