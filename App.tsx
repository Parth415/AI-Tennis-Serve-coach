
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
// FIX: Corrected import for the default export 'Coach'. The original import had incorrect syntax.
import Coach from './pages/Coach';
// FIX: Corrected import for the default export 'Profile'. The original import had incorrect syntax.
import Profile from './pages/Profile';
// FIX: Corrected import for the default export 'History'. The original import had incorrect syntax.
import History from './pages/History';
import Analytics from './pages/Analytics';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Session, UserProfile, PracticeAnalysis } from './types';

type Page = 'coach' | 'profile' | 'history' | 'analytics';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('coach');
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', {
    name: '',
    age: '',
    skillLevel: '',
    playingHand: '',
  });
  const [sessionHistory, setSessionHistory] = useLocalStorage<Session[]>('sessionHistory', []);

  const handleSessionAnalyzed = useCallback((analysisData: PracticeAnalysis | string, type: 'practice' | 'image') => {
    const newSession: Session = {
      id: `session_${new Date().getTime()}`,
      timestamp: new Date().getTime(),
      type,
      data: analysisData,
    };
    setSessionHistory(prevHistory => [newSession, ...prevHistory]);
  }, [setSessionHistory]);

  const renderPage = () => {
    switch (currentPage) {
      case 'coach':
        return <Coach onSessionAnalyzed={handleSessionAnalyzed} userProfile={userProfile} />;
      case 'profile':
        return <Profile userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'history':
        return <History sessionHistory={sessionHistory} />;
      case 'analytics':
        return <Analytics sessionHistory={sessionHistory} />;
      default:
        return <Coach onSessionAnalyzed={handleSessionAnalyzed} userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
