
import React, { useState } from 'react';
import { Session, PracticeAnalysis } from '../types';
import { Modal } from '../components/Modal';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { HistoryIcon } from '../components/icons/HistoryIcon';
import { TennisBallIcon } from '../components/icons/TennisBallIcon';
import { UploadIcon } from '../components/icons/UploadIcon';

interface HistoryProps {
  sessionHistory: Session[];
}

const SessionCard: React.FC<{ session: Session; onClick: () => void; }> = ({ session, onClick }) => {
  const isPractice = session.type === 'practice';
  const data = session.data as (PracticeAnalysis | string);
  
  let summary = "Image Analysis";
  if (isPractice && typeof data === 'object') {
    summary = `${data.totalServes} serves analyzed.`;
  }

  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-full mr-4 ${isPractice ? 'bg-blue-100' : 'bg-purple-100'}`}>
          {isPractice ? <TennisBallIcon className="h-6 w-6 text-blue-600" /> : <UploadIcon className="h-6 w-6 text-purple-600" />}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{isPractice ? 'Practice Session' : 'Serve Analysis'}</p>
          <p className="text-sm text-gray-600">{new Date(session.timestamp).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{summary}</p>
        </div>
      </div>
    </button>
  );
};


const History: React.FC<HistoryProps> = ({ sessionHistory }) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Session History</h2>
            {sessionHistory.length > 0 ? (
                <div className="space-y-4">
                    {sessionHistory.map(session => (
                        <SessionCard key={session.id} session={session} onClick={() => setSelectedSession(session)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <HistoryIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No History Yet</h3>
                    <p className="mt-2 text-gray-500">
                        Complete a practice session or upload a serve to see your analysis history here.
                    </p>
                </div>
            )}
        </div>
      </div>
      {selectedSession && (
        <Modal onClose={() => setSelectedSession(null)}>
          {selectedSession.type === 'practice' ? (
            <AnalyticsDashboard data={selectedSession.data as PracticeAnalysis} sessionId={selectedSession.id} />
          ) : (
            <AnalysisDisplay analysis={selectedSession.data as string} sessionId={selectedSession.id} />
          )}
        </Modal>
      )}
    </>
  );
};

export default History;
