
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import Coach from './pages/Coach';
import Profile from './pages/Profile';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import * as storageService from './services/storageService';
import { Session, UserProfile, PracticeAnalysis, UserAccount } from './types';
import { AlertTriangleIcon } from './components/icons/AlertTriangleIcon';

type Page = 'coach' | 'profile' | 'history' | 'analytics';
type AuthPage = 'login' | 'signup' | 'reset';

// This component holds the main application logic and is only rendered when a user is logged in.
const AppContent: React.FC<{ userEmail: string; onLogout: () => void; headerTop: string; }> = ({ userEmail, onLogout, headerTop }) => {
  const [currentPage, setCurrentPage] = useState<Page>('coach');

  // State management refactored to use useState + storageService
  const [userProfile, _setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile(userEmail));
  const [sessionHistory, _setSessionHistory] = useState<Session[]>(() => storageService.getSessionHistory(userEmail));

  const setUserProfile = (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    const valueToStore = profile instanceof Function ? profile(userProfile) : profile;
    storageService.saveUserProfile(userEmail, valueToStore);
    _setUserProfile(valueToStore);
  };

  const setSessionHistory = (history: Session[] | ((prev: Session[]) => Session[])) => {
    const valueToStore = history instanceof Function ? history(sessionHistory) : history;
    storageService.saveSessionHistory(userEmail, valueToStore);
    _setSessionHistory(valueToStore);
  };


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
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={userEmail}
        onLogout={onLogout}
        headerTop={headerTop}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};


// The main App component now acts as an authentication wrapper.
const App: React.FC = () => {
  // State management refactored to use useState + storageService
  const [currentUser, _setCurrentUser] = useState<string | null>(storageService.getCurrentUser);
  const [accounts, _setAccounts] = useState<Record<string, UserAccount>>(storageService.getAccounts);
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  const storageUnavailable = !storageService.isStorageAvailable;
  // Calculate the top offset for the sticky header based on whether the banner is shown.
  // The banner has a height of h-[52px].
  const headerTop = storageUnavailable ? 'top-[52px]' : 'top-0';

  // Custom setters to sync state with storage
  const setCurrentUser = (email: string | null) => {
    if (email) {
      storageService.setCurrentUser(email);
    } else {
      storageService.clearCurrentUser();
    }
    _setCurrentUser(email);
  };

  const setAccounts = (newAccounts: Record<string, UserAccount> | ((prev: Record<string, UserAccount>) => Record<string, UserAccount>)) => {
    const valueToStore = newAccounts instanceof Function ? newAccounts(accounts) : newAccounts;
    storageService.saveAccounts(valueToStore);
    _setAccounts(valueToStore);
  };

  const handleLogin = (email: string, pass: string): boolean => {
    const account = accounts[email];
    if (account && account.password === pass) {
      setCurrentUser(email);
      return true;
    }
    return false;
  };
  
  const handleSignUp = (email: string, pass: string): boolean => {
     if (accounts[email]) {
      return false; // Account already exists
    }
    setAccounts(prevAccounts => ({ ...prevAccounts, [email]: { password: pass } }));
    setCurrentUser(email);
    return true;
  };

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAuthPage('login');
  }, []);
  
  // This effect ensures that if the currentUser becomes invalid (e.g., accounts are 
  // cleared from another tab, or old data exists in localStorage), the user is logged out.
  useEffect(() => {
    if (currentUser && !accounts[currentUser]) {
      handleLogout();
    }
  }, [currentUser, accounts, handleLogout]);

  const renderAuthPage = () => {
    switch(authPage) {
        case 'signup':
            return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setAuthPage('login')} />;
        case 'reset':
            return <ResetPassword onSwitchToLogin={() => setAuthPage('login')} />;
        case 'login':
        default:
            return <Login 
                onLogin={handleLogin}
                onSwitchToSignUp={() => setAuthPage('signup')}
                onSwitchToReset={() => setAuthPage('reset')}
            />;
    }
  }

  return (
    <>
      {storageUnavailable && (
        <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 p-3 text-center text-sm sticky top-0 z-20 shadow-sm flex items-center justify-center h-[52px]" role="alert">
            <div className="container mx-auto flex items-center justify-center">
                <AlertTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <p>
                    <strong>Warning:</strong> Your browser settings may be blocking storage, so your session won't be saved. Try opening the app in a new tab.
                </p>
            </div>
        </div>
      )}

      {!currentUser ? (
        renderAuthPage()
      ) : (
        <AppContent userEmail={currentUser} onLogout={handleLogout} headerTop={headerTop} />
      )}
    </>
  );
};


export default App;