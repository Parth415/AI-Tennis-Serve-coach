
import React from 'react';
import { TennisBallIcon } from './icons/TennisBallIcon';
import { UserIcon } from './icons/UserIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';

interface HeaderProps {
  currentPage: 'coach' | 'profile' | 'history' | 'analytics';
  setCurrentPage: (page: 'coach' | 'profile' | 'history' | 'analytics') => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      ${isActive
        ? 'bg-green-100 text-green-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    {children}
  </button>
);


export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <TennisBallIcon className="h-10 w-10 text-green-500" />
          <h1 className="ml-3 text-3xl font-bold text-gray-800 tracking-tight">
            Serve <span className="text-green-600">Sensei</span>
          </h1>
        </div>
        <nav className="flex items-center space-x-2 md:space-x-4">
          <NavButton onClick={() => setCurrentPage('coach')} isActive={currentPage === 'coach'}>
            <TennisBallIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Coach</span>
          </NavButton>
          <NavButton onClick={() => setCurrentPage('profile')} isActive={currentPage === 'profile'}>
            <UserIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </NavButton>
          <NavButton onClick={() => setCurrentPage('history')} isActive={currentPage === 'history'}>
             <HistoryIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">History</span>
          </NavButton>
          <NavButton onClick={() => setCurrentPage('analytics')} isActive={currentPage === 'analytics'}>
             <AnalyticsIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </NavButton>
        </nav>
      </div>
    </header>
  );
};
