
import React, { useRef, useEffect } from 'react';

interface LiveFeedProps {
  stream: MediaStream | null;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full flex-grow bg-black rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror view for a more natural feel
      />
      {!stream && <p className="text-white">Waiting for camera access...</p>}
    </div>
  );
};
