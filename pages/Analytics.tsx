
import React, { useState, useMemo } from 'react';
import { Session, PracticeAnalysis } from '../types';
import { LineChart, ChartDataPoint } from '../components/LineChart';
import { AnalyticsIcon } from '../components/icons/AnalyticsIcon';

interface AnalyticsProps {
  sessionHistory: Session[];
}

type MetricKey = 'toss' | 'pronation' | 'followThrough';

const METRIC_CONFIG: Record<MetricKey, { title: string; dataKey: keyof PracticeAnalysis['metrics'] }> = {
    toss: { title: 'Toss Consistency', dataKey: 'goodToss' },
    pronation: { title: 'Pronation Quality', dataKey: 'goodPronation' },
    followThrough: { title: 'Follow-Through Fluidity', dataKey: 'goodFollowThrough' },
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
                <p className="text-sm font-medium text-gray-600">Average Consistency</p>
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

const SingleSessionSummary: React.FC<{ sessionData: { toss: number, pronation: number, followThrough: number } }> = ({ sessionData }) => (
    <div className="text-center py-12">
        <AnalyticsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Your First Session is Logged!</h3>
        <p className="mt-2 text-gray-500 mb-6">
            Complete one more session to start tracking your progress over time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center max-w-lg mx-auto">
            <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Toss Consistency</p>
                <p className="text-2xl font-bold text-green-600">{sessionData.toss}%</p>
            </div>
             <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Pronation Quality</p>
                <p className="text-2xl font-bold text-green-600">{sessionData.pronation}%</p>
            </div>
             <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Follow-Through</p>
                <p className="text-2xl font-bold text-green-600">{sessionData.followThrough}%</p>
            </div>
        </div>
    </div>
);

const Analytics: React.FC<AnalyticsProps> = ({ sessionHistory }) => {
  const [activeTab, setActiveTab] = useState<MetricKey>('toss');

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

    const processMetric = (dataKey: keyof PracticeAnalysis['metrics']): ChartDataPoint[] => {
        return practiceSessions.map(s => ({
            x: s.timestamp,
            y: Math.round((s.data.metrics[dataKey].count / s.data.totalServes) * 100),
        }));
    };

    return {
        toss: processMetric('goodToss'),
        pronation: processMetric('goodPronation'),
        followThrough: processMetric('goodFollowThrough'),
    };
  }, [practiceSessions]);
  
  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium focus:outline-none transition-colors w-full md:w-auto ${
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
         const summaryData = {
            toss: chartData!.toss[0].y,
            pronation: chartData!.pronation[0].y,
            followThrough: chartData!.followThrough[0].y,
         };
         return <SingleSessionSummary sessionData={summaryData} />;
    }
    
    const activeData = chartData![activeTab];

    return (
        <div className="space-y-6">
            <LineChart 
                data={activeData} 
                title={METRIC_CONFIG[activeTab].title}
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
        <div className="flex flex-col md:flex-row border-b border-gray-200">
            {Object.keys(METRIC_CONFIG).map((key) => (
                 <TabButton 
                    key={key}
                    active={activeTab === key} 
                    onClick={() => setActiveTab(key as MetricKey)}
                >
                    {METRIC_CONFIG[key as MetricKey].title}
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
