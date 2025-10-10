import React from 'react';
import { PracticeAnalysis } from '../types';
import { Feedback } from './Feedback';
import { VerbalFeedbackControl } from './VerbalFeedbackControl';
import { ConversationalCoach } from './ConversationalCoach';
import { ServePhaseCard } from './ServePhaseCard';

interface AnalyticsDashboardProps {
  data: PracticeAnalysis;
  sessionId: string;
}

const generateVerbalFeedbackScript = (data: PracticeAnalysis): string => {
    return `
        Great session! I detected a total of ${data.totalServes} serves. 
        My overall impression is that ${data.overallImpression.toLowerCase()}.
        Let's break down your form. For your stance and setup, the main thing to work on is ${data.stanceAndSetup.improvement}.
        For your toss and wind-up, focus on ${data.tossAndWindup.improvement}.
        And for your follow-through, remember to work on ${data.followThrough.improvement}.
        Keep up the great work!
    `;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, sessionId }) => {
  const verbalScript = generateVerbalFeedbackScript(data);

  const phases = [
    { title: "Stance & Setup", data: data.stanceAndSetup },
    { title: "Toss & Wind-up", data: data.tossAndWindup },
    { title: "Trophy Pose", data: data.trophyPose },
    { title: "Contact & Pronation", data: data.contactAndPronation },
    { title: "Follow-Through", data: data.followThrough },
  ];

  return (
    <div className="h-full overflow-y-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">In-Depth Serve Biomechanics</h2>
        <p className="text-sm text-gray-500 mt-1">{data.overallImpression}</p>
      </div>
      
      {/* Verbal Feedback */}
      <VerbalFeedbackControl script={verbalScript} />

      {/* Total Serves */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-lg font-medium text-gray-600">Total Serves Detected</p>
        <p className="text-5xl font-bold text-green-600">{data.totalServes}</p>
      </div>

      {/* Biomechanics Breakdown */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Biomechanics Breakdown</h3>
        <div className="space-y-4">
          {phases.map(phase => (
            <ServePhaseCard key={phase.title} title={phase.title} feedback={phase.data} />
          ))}
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
