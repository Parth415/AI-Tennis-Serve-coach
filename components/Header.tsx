import React, { useState, useEffect, useRef } from 'react';
import { TennisBallIcon } from './icons/TennisBallIcon';
import { UserIcon } from './icons/UserIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';

type Page = 'coach' | 'profile' | 'history' | 'analytics';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentUser: string;
  onLogout: () => void;
  headerTop: string;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  isMobile?: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, isMobile = false, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left p-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      ${isMobile ? 'text-base' : ''}
      ${isActive
        ? 'bg-green-100 text-green-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    {children}
  </button>
);


export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, currentUser, onLogout, headerTop }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };
  
  const handleLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
  }

  return (
    <header className={`bg-white shadow-md sticky ${headerTop} z-10`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <TennisBallIcon className="h-10 w-10 text-green-500" />
          <h1 className="ml-3 text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Serve <span className="text-green-600">Sensei</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              <NavButton onClick={() => handleNavClick('coach')} isActive={currentPage === 'coach'}>
                <TennisBallIcon className="h-5 w-5 mr-2" />
                <span>Coach</span>
              </NavButton>
              <NavButton onClick={() => handleNavClick('profile')} isActive={currentPage === 'profile'}>
                <UserIcon className="h-5 w-5 mr-2" />
                <span>Profile</span>
              </NavButton>
              <NavButton onClick={() => handleNavClick('history')} isActive={currentPage === 'history'}>
                 <HistoryIcon className="h-5 w-5 mr-2" />
                <span>History</span>
              </NavButton>
              <NavButton onClick={() => handleNavClick('analytics')} isActive={currentPage === 'analytics'}>
                 <AnalyticsIcon className="h-5 w-5 mr-2" />
                <span>Analytics</span>
              </NavButton>
            </nav>

            <div className="h-8 border-l border-gray-300 mx-2"></div>

            <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-600 hidden lg:block truncate" title={currentUser}>
                    {currentUser}
                </p>
                <button
                    onClick={handleLogoutClick}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    title="Logout"
                    aria-label="Logout"
                >
                    <LogoutIcon className="h-5 w-5" />
                </button>
            </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Open main menu"
                aria-expanded={isMenuOpen}
            >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div ref={menuRef} className="md:hidden absolute top-full right-4 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="p-4 space-y-2">
                <NavButton onClick={() => handleNavClick('coach')} isActive={currentPage === 'coach'} isMobile>
                    <TennisBallIcon className="h-5 w-5 mr-3" />
                    Coach
                </NavButton>
                <NavButton onClick={() => handleNavClick('profile')} isActive={currentPage === 'profile'} isMobile>
                    <UserIcon className="h-5 w-5 mr-3" />
                    Profile
                </NavButton>
                <NavButton onClick={() => handleNavClick('history')} isActive={currentPage === 'history'} isMobile>
                    <HistoryIcon className="h-5 w-5 mr-3" />
                    History
                </NavButton>
                <NavButton onClick={() => handleNavClick('analytics')} isActive={currentPage === 'analytics'} isMobile>
                    <AnalyticsIcon className="h-5 w-5 mr-3" />
                    Analytics
                </NavButton>

                <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="px-3 mb-3">
                        <p className="text-sm font-medium text-gray-800">Signed in as</p>
                        <p className="text-sm text-gray-600 truncate">{currentUser}</p>
                    </div>
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center p-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                        <LogoutIcon className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
      )}
    </header>
  );
};
