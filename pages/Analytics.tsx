import React, { useState, useMemo } from 'react';
import { Session, PracticeAnalysis } from '../types';
import { LineChart, ChartDataPoint } from '../components/LineChart';
import { AnalyticsIcon } from '../components/icons/AnalyticsIcon';

interface AnalyticsProps {
  sessionHistory: Session[];
}

// All five phases of the serve analysis are now included.
type MetricKey = 'stanceAndSetup' | 'tossAndWindup' | 'trophyPose' | 'contactAndPronation' | 'followThrough';

const METRIC_CONFIG: Record<MetricKey, { title: string, chartTitle: string }> = {
    stanceAndSetup: { title: 'Stance & Setup', chartTitle: 'Stance & Setup Score' },
    tossAndWindup: { title: 'Toss & Wind-up', chartTitle: 'Toss & Wind-up Score' },
    trophyPose: { title: 'Trophy Pose', chartTitle: 'Trophy Pose Score' },
    contactAndPronation: { title: 'Contact & Pronation', chartTitle: 'Contact & Pronation Score' },
    followThrough: { title: 'Follow-Through', chartTitle: 'Follow-Through Score' },
};

const Insight: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    if (data.length < 2) {
        return <p className="text-sm text-gray-500">More sessions are needed to calculate trends.</p>;
    }
    const average = data.reduce((sum, point) => sum + point.y, 0) / data.length;
    const firstValue = data[0].y;
    const lastValue = data[data.length - 1].y;
    const trend = lastValue - firstValue;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{average.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Overall Trend</p>
                <p className={`text-2xl font-bold ${trend >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </p>
            </div>
        </div>
    );
}

// The summary for the first session now displays scores for all five metrics.
const SingleSessionSummary: React.FC<{ sessionData: PracticeAnalysis }> = ({ sessionData }) => (
    <div className="text-center py-12">
        <AnalyticsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Your First Session is Logged!</h3>
        <p className="mt-2 text-gray-500 mb-6">
            Complete one more session to start tracking your progress over time.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
             {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(key => (
                 <div key={key} className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">{METRIC_CONFIG[key].title}</p>
                    <p className="text-2xl font-bold text-green-600">{sessionData[key].score * 10}%</p>
                </div>
            ))}
        </div>
    </div>
);

const Analytics: React.FC<AnalyticsProps> = ({ sessionHistory }) => {
  // The default active tab is now the first phase.
  const [activeTab, setActiveTab] = useState<MetricKey>('stanceAndSetup');

  const practiceSessions = useMemo(() => {
    return sessionHistory
      .filter(s => s.type === 'practice' && typeof s.data === 'object' && (s.data as PracticeAnalysis).totalServes > 0)
      .map(s => s as Session & { data: PracticeAnalysis })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [sessionHistory]);

  const chartData = useMemo(() => {
    if (practiceSessions.length === 0) {
      return null;
    }
    // Chart data is now calculated for all five metrics.
    const data: Record<MetricKey, ChartDataPoint[]> = {
        stanceAndSetup: [],
        tossAndWindup: [],
        trophyPose: [],
        contactAndPronation: [],
        followThrough: [],
    };

    for (const s of practiceSessions) {
        (Object.keys(data) as MetricKey[]).forEach(key => {
             if (s.data[key]) { // Defensive check
                data[key].push({ x: s.timestamp, y: s.data[key].score * 10 });
            }
        });
    }
    return data;
  }, [practiceSessions]);
  
  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-3 text-xs sm:text-sm font-medium focus:outline-none transition-colors flex-auto text-center ${
        active
          ? 'border-b-2 border-green-600 text-green-600 bg-green-50'
          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );

  const renderContent = () => {
    if (practiceSessions.length === 0) {
        return (
             <div className="text-center py-12">
                <AnalyticsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No Practice Data Found</h3>
                <p className="mt-2 text-gray-500">
                    Complete a practice session to see your analytics and track your progress.
                </p>
            </div>
        );
    }
    
    if (practiceSessions.length < 2) {
         return <SingleSessionSummary sessionData={practiceSessions[0].data} />;
    }
    
    const activeData = chartData![activeTab];

    return (
        <div className="space-y-6">
            <LineChart 
                data={activeData} 
                title={METRIC_CONFIG[activeTab].chartTitle}
            />
            <div>
                 <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Insights</h3>
                 <Insight data={activeData} />
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="p-6 md:p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Serve Analytics & Insights</h2>
            <p className="text-gray-600 mt-1">Track your serving performance over time.</p>
        </div>
        {/* The tab container now wraps to accommodate all metrics on smaller screens. */}
        <div className="flex flex-wrap border-b border-gray-200">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => (
                 <TabButton 
                    key={key}
                    active={activeTab === key} 
                    onClick={() => setActiveTab(key)}
                >
                    {METRIC_CONFIG[key].title}
                </TabButton>
            ))}
        </div>
        <div className="p-6 md:p-8">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Analytics;