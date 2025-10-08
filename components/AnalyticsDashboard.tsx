import React from 'react';
import { PracticeAnalysis } from '../types';
import { MetricCard } from './MetricCard';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { Feedback } from './Feedback';
import { VerbalFeedbackControl } from './VerbalFeedbackControl';
import { ConversationalCoach } from './ConversationalCoach';

interface AnalyticsDashboardProps {
  data: PracticeAnalysis;
  sessionId: string;
}

const generateVerbalFeedbackScript = (data: PracticeAnalysis): string => {
    return `
        Great session! I detected a total of ${data.totalServes} serves. 
        My overall impression is that ${data.overallImpression.toLowerCase()}
    `;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, sessionId }) => {
  const verbalScript = generateVerbalFeedbackScript(data);

  return (
    <div className="h-full overflow-y-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Session Analytics</h2>
        <p className="text-sm text-gray-500">{data.overallImpression}</p>
      </div>
      
      {/* Verbal Feedback */}
      <VerbalFeedbackControl script={verbalScript} />

      {/* Total Serves */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-lg font-medium text-gray-600">Total Serves Detected</p>
        <p className="text-5xl font-bold text-green-600">{data.totalServes}</p>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Key Metrics</h3>
        <div className="space-y-4">
          <MetricCard
            label="Good Toss"
            count={data.metrics.goodToss.count}
            total={data.totalServes}
            description={data.metrics.goodToss.description}
          />
          <MetricCard
            label="Good Pronation"
            count={data.metrics.goodPronation.count}
            total={data.totalServes}
            description={data.metrics.goodPronation.description}
          />
          <MetricCard
            label="Good Follow-Through"
            count={data.metrics.goodFollowThrough.count}
            total={data.totalServes}
            description={data.metrics.goodFollowThrough.description}
          />
        </div>
      </div>
      
      {/* Qualitative Feedback */}
      <div className="space-y-4">
        {/* Strengths */}
        <div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
            <h3 className="ml-2 text-xl font-semibold text-gray-800">Strengths</h3>
          </div>
          <ul className="mt-2 ml-8 list-disc list-outside space-y-1 text-gray-700">
            {data.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div>
           <div className="flex items-center">
            <LightbulbIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <h3 className="ml-2 text-xl font-semibold text-gray-800">Areas for Improvement</h3>
          </div>
           <ul className="mt-2 ml-8 space-y-3 text-gray-700">
            {data.areasForImprovement.map((item, index) => (
              <li key={index}>
                <p className="font-semibold">{item.point}</p>
                <p className="text-sm text-gray-600"><strong>Drill:</strong> {item.drill}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Conversational Coach */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
          <ConversationalCoach analysisData={data} />
      </div>

      {/* Feedback Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <Feedback analysisId={sessionId} />
      </div>
    </div>
  );
};
