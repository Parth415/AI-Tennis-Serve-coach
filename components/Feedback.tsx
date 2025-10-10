
import React, { useState, useEffect } from 'react';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import * as storageService from '../services/storageService';

interface FeedbackProps {
  analysisId: string;
}

export const Feedback: React.FC<FeedbackProps> = ({ analysisId }) => {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    // Only try to access storage if it's available.
    if (storageService.isStorageAvailable) {
        const storedVote = storageService.getFeedback(analysisId);
        if (storedVote) {
          setVote(storedVote);
          setFeedbackSubmitted(true);
        }
    }
  }, [analysisId]);

  const handleVote = (newVote: 'up' | 'down') => {
    if (feedbackSubmitted || !storageService.isStorageAvailable) return;

    storageService.saveFeedback(analysisId, newVote);
    setVote(newVote);
    setFeedbackSubmitted(true);
  };

  // If storage is not available, don't render the component at all.
  if (!storageService.isStorageAvailable) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-600 mb-2">Was this feedback helpful?</h4>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleVote('up')}
          disabled={feedbackSubmitted}
          aria-pressed={vote === 'up'}
          className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            ${vote === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
            ${feedbackSubmitted && vote !== 'up' ? 'opacity-50 cursor-not-allowed' : ''}
            ${feedbackSubmitted && vote === 'up' ? '' : 'disabled:opacity-50 disabled:cursor-not-allowed'}`}
          aria-label="Helpful"
        >
          <ThumbsUpIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleVote('down')}
          disabled={feedbackSubmitted}
          aria-pressed={vote === 'down'}
          className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
            ${vote === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
            ${feedbackSubmitted && vote !== 'down' ? 'opacity-50 cursor-not-allowed' : ''}
            ${feedbackSubmitted && vote === 'down' ? '' : 'disabled:opacity-50 disabled:cursor-not-allowed'}`}
          aria-label="Not helpful"
        >
          <ThumbsDownIcon className="w-5 h-5" />
        </button>
        {feedbackSubmitted && <p className="text-sm text-gray-500">Thanks for your feedback!</p>}
      </div>
    </div>
  );
};