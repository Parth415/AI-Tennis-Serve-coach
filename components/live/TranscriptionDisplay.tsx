
import React, { useRef, useEffect } from 'react';

interface TranscriptionDisplayProps {
  history: { speaker: 'You' | 'Coach'; text: string }[];
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ history }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex-shrink-0">AI Coach Feed</h2>
      <div className="flex-grow bg-white p-4 rounded-lg border border-gray-200 overflow-y-auto">
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={index}
              className={`flex items-start ${entry.speaker === 'You' ? 'justify-end' : ''}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs md:max-w-sm lg:max-w-md ${
                  entry.speaker === 'You'
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="font-bold text-sm mb-1">{entry.speaker}</p>
                <p className="text-base">{entry.text}</p>
              </div>
            </div>
          ))}
           <div ref={endOfMessagesRef} />
        </div>
        {history.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>The conversation with your coach will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};
