import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const AppHeader = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleInstallClick = () => {
    // PWA installation logic
    console.log('Install app clicked');
  };

  return (
    <header className="app-header bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 pt-safe-top pb-2 relative z-10 shadow-sm transition-colors">
      <div className="header-content flex justify-between items-center">
        <h1 className="app-title text-xl font-bold text-primary-600 dark:text-primary-400">
          💪 Gym Tracker
        </h1>
        <div className="header-actions flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="theme-toggle p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={handleInstallClick}
            className="install-btn bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            style={{ display: 'none' }}
          >
            Install App
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;