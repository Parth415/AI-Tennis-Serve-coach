import React from 'react';
import { ServePhaseFeedback } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

interface ServePhaseCardProps {
  title: string;
  feedback: ServePhaseFeedback;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 10;
    const circumference = 2 * Math.PI * 18; // 2 * pi * r
    const offset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-red-500';
    if (score >= 7) {
        colorClass = 'text-green-500';
    } else if (score >= 4) {
        colorClass = 'text-yellow-500';
    }

    return (
        <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                />
                <circle
                    className={colorClass}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                    transform="rotate(-90 20 20)"
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${colorClass}`}>
                {score}
            </span>
        </div>
    );
};

export const ServePhaseCard: React.FC<ServePhaseCardProps> = ({ title, feedback }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-start space-x-4">
        <ScoreCircle score={feedback.score} />
        <div className="flex-grow">
          <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
          <p className="text-sm text-gray-500">Score: {feedback.score}/10</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 pl-1">
        <div className="flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm text-gray-700"><strong className="font-semibold">What you're doing well:</strong> {feedback.positive}</p>
        </div>
         <div className="flex items-start">
            <LightbulbIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm text-gray-700"><strong className="font-semibold">Area for improvement:</strong> {feedback.improvement}</p>
        </div>
         <div className="flex items-start">
            <ClipboardListIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm text-gray-700"><strong className="font-semibold">Recommended drill:</strong> {feedback.drill}</p>
        </div>
      </div>
    </div>
  );
};
