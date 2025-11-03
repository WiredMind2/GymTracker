import React from 'react';

const AppHeader = () => {
  const handleInstallClick = () => {
    // PWA installation logic
    console.log('Install app clicked');
  };

  return (
    <header className="app-header bg-white border-b border-gray-200 px-4 pt-safe-top pb-2 relative z-10 shadow-sm">
      <div className="header-content flex justify-between items-center">
        <h1 className="app-title text-xl font-bold text-primary-600">
          💪 Gym Tracker
        </h1>
        <button 
          onClick={handleInstallClick}
          className="install-btn bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
          style={{ display: 'none' }}
        >
          Install App
        </button>
      </div>
    </header>
  );
};

export default AppHeader;