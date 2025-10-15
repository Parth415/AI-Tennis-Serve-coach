import React, { useState, useMemo, useEffect } from 'react';
import { Session, PracticeAnalysis, UserProfile } from '../types';
import { LineChart, ChartDataPoint } from '../components/LineChart';
import { AnalyticsIcon } from '../components/icons/AnalyticsIcon';

// ====== Analytics Section ======

interface AnalyticsSectionProps {
  sessionHistory: Session[];
}

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

const SingleSessionSummary: React.FC<{ sessionData: PracticeAnalysis }> = ({ sessionData }) => (
    <div className="text-center py-12">
        <AnalyticsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Your First Session is Logged!</h3>
        <p className="mt-2 text-gray-500 mb-6">
            Complete one more session to start tracking your progress over time.
        </p>
        <div className="max-w-sm mx-auto space-y-3">
             {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(key => (
                 <div key={key} className="bg-gray-100 p-3 rounded-lg flex items-baseline justify-between">
                    <p className="text-sm font-medium text-gray-600 text-left">{METRIC_CONFIG[key].title}</p>
                    <p className="text-2xl font-bold text-green-600">{sessionData[key] ? `${sessionData[key].score * 10}%` : 'N/A'}</p>
                </div>
            ))}
        </div>
    </div>
);

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ sessionHistory }) => {
  const [activeTab, setActiveTab] = useState<MetricKey>('stanceAndSetup');

  const practiceSessions = useMemo(() => {
    return sessionHistory
      .filter(s => {
        return s.type === 'practice' && 
               typeof s.data === 'object' && 
               s.data !== null && 
               'stanceAndSetup' in s.data &&
               'tossAndWindup' in s.data &&
               'trophyPose' in s.data &&
               'contactAndPronation' in s.data &&
               'followThrough' in s.data
      })
      .map(s => s as Session & { data: PracticeAnalysis })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [sessionHistory]);

  const chartData = useMemo(() => {
    if (practiceSessions.length === 0) {
      return null;
    }
    const data: Record<MetricKey, ChartDataPoint[]> = {
        stanceAndSetup: [],
        tossAndWindup: [],
        trophyPose: [],
        contactAndPronation: [],
        followThrough: [],
    };

    for (const s of practiceSessions) {
        (Object.keys(data) as MetricKey[]).forEach(key => {
            data[key].push({ x: s.timestamp, y: s.data[key].score * 10 });
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

// ====== Profile Section ======

interface ProfileSectionProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

const SERVE_GOALS_OPTIONS = [
  'Increase Serve Speed',
  'Improve First Serve Percentage',
  'Improve Slice Serve',
  'Improve Kick Serve',
  'Reduce Double Faults',
];

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, setUserProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? (value === '' ? '' : parseInt(value, 10)) : value }));
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
        const currentGoals = prev.serveGoals || [];
        if (checked) {
            return { ...prev, serveGoals: [...currentGoals, value] };
        } else {
            return { ...prev, serveGoals: currentGoals.filter(goal => goal !== value) };
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Your Profile</h2>
        <p className="text-gray-600 mb-6">This information helps the AI coach provide more personalized feedback.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={labelClasses}>Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="e.g., Alex"
            />
          </div>
          
          <div>
            <label htmlFor="age" className={labelClasses}>Age</label>
            <input
              type="number"
              name="age"
              id="age"
              value={formData.age}
              onChange={handleChange}
              className={inputClasses}
              placeholder="e.g., 25"
            />
          </div>

          <div>
            <label htmlFor="skillLevel" className={labelClasses}>Skill Level</label>
            <select
              name="skillLevel"
              id="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Select...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Playing Hand</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="playingHand"
                  value="Right"
                  checked={formData.playingHand === 'Right'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <span className="ml-2 text-gray-700">Right</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="playingHand"
                  value="Left"
                  checked={formData.playingHand === 'Left'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <span className="ml-2 text-gray-700">Left</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="preferredCourtSurface" className={labelClasses}>Preferred Court Surface</label>
            <select
              name="preferredCourtSurface"
              id="preferredCourtSurface"
              value={formData.preferredCourtSurface || ''}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Select...</option>
              <option value="Hard">Hard</option>
              <option value="Clay">Clay</option>
              <option value="Grass">Grass</option>
            </select>
          </div>

          <div>
            <label htmlFor="racquetType" className={labelClasses}>Racquet Type</label>
            <input
              type="text"
              name="racquetType"
              id="racquetType"
              value={formData.racquetType || ''}
              onChange={handleChange}
              className={inputClasses}
              placeholder="e.g., Babolat Pure Aero"
            />
          </div>

          <div>
            <label className={labelClasses}>Primary Serve Goals</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {SERVE_GOALS_OPTIONS.map(goal => (
                <label key={goal} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="serveGoals"
                    value={goal}
                    checked={(formData.serveGoals || []).includes(goal)}
                    onChange={handleGoalChange}
                    className="form-checkbox h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            {isSaved && <p className="text-sm text-green-600 mr-4">Profile saved!</p>}
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ====== Main Component ======

interface ProgressProps {
    sessionHistory: Session[];
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

const Progress: React.FC<ProgressProps> = ({ sessionHistory, userProfile, setUserProfile }) => {
    return (
        <div className="space-y-8">
            <AnalyticsSection sessionHistory={sessionHistory} />
            <ProfileSection userProfile={userProfile} setUserProfile={setUserProfile} />
        </div>
    );
};

export default Progress;
