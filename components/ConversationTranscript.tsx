import React, { useRef, useEffect } from 'react';

interface ConversationTranscriptProps {
  history: { speaker: 'You' | 'Coach'; text: string }[];
}

export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({ history }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <div className="h-64 bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-auto">
      <div className="space-y-4">
        {history.map((entry, index) => (
          <div
            key={index}
            className={`flex items-start ${entry.speaker === 'You' ? 'justify-end' : ''}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs md:max-w-sm ${
                entry.speaker === 'You'
                  ? 'bg-green-100 text-green-900'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="font-bold text-sm mb-1">{entry.speaker}</p>
              <p className="text-base break-words">{entry.text}</p>
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      {history.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
              <p>Your conversation with the coach will appear here.</p>
          </div>
      )}
    </div>
  );
};
