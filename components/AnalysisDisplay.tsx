
import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { Feedback } from './Feedback';

interface AnalysisDisplayProps {
  analysis: string;
  sessionId: string;
}

// This component is defined outside of AnalysisDisplay to prevent re-creation on every render.
const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-4">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    const title = line.substring(4);
                    const isStrengths = title.toLowerCase().includes('strengths');
                    return (
                        <div key={index} className="flex items-start mt-6">
                            {isStrengths ? <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" /> : <LightbulbIcon className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />}
                            <h3 className="ml-3 text-xl font-semibold text-gray-800">{title}</h3>
                        </div>
                    );
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-gray-900 border-b pb-2">{line.substring(3)}</h2>;
                }
                if (line.startsWith('* ')) {
                    return <p key={index} className="text-gray-700 ml-9 pl-1">{line.substring(2)}</p>;
                }
                return <p key={index} className="text-gray-700">{line}</p>;
            })}
        </div>
    );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, sessionId }) => {
  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Coach Feedback</h2>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <FormattedAnalysis text={analysis} />
        <Feedback analysisId={sessionId} />
      </div>
    </div>
  );
};
