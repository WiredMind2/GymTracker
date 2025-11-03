import React from 'react';

const SettingsPage = () => {
  const handleExportData = () => {
    if (window.showNotification) {
      window.showNotification('Data export will be available soon', 'info');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (window.showNotification) {
        window.showNotification('Data clearing will be available soon', 'info');
      }
    }
  };

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="settings-content space-y-6">
        <div className="setting-section bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="setting-item mb-4">
            <button 
              onClick={handleExportData}
              className="w-full bg-primary-600 text-white px-4 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              Export All Data
            </button>
          </div>
          <div className="setting-item">
            <button 
              onClick={handleClearData}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>

        <div className="setting-section bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <div className="setting-info text-sm text-gray-600">
            <p className="mb-2">Gym Tracker React v1.0.0</p>
            <p>Your personal workout tracking companion built with React and Tailwind CSS.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;