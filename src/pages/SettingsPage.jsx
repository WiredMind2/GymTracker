import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { exportData, importData, clearAllData } = useDatabase();

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (window.showNotification) {
        window.showNotification('Data exported successfully!', 'success');
      }
    } catch (err) {
      if (window.showNotification) {
        window.showNotification('Failed to export data', 'error');
      }
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await importData(data);
          
          if (window.showNotification) {
            window.showNotification('Data imported successfully!', 'success');
          }
        } catch (err) {
          if (window.showNotification) {
            window.showNotification('Failed to import data. Please check the file format.', 'error');
          }
        }
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await clearAllData();
        if (window.showNotification) {
          window.showNotification('All data cleared successfully', 'success');
        }
      } catch (err) {
        if (window.showNotification) {
          window.showNotification('Failed to clear data', 'error');
        }
      }
    }
  };

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      </div>

      <div className="settings-content space-y-6">
        <div className="setting-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h3>
          <div className="setting-item">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Theme</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Switch to {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </div>

        <div className="setting-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h3>
          <div className="space-y-3">
            <button 
              onClick={handleExportData}
              className="w-full bg-primary-600 text-white px-4 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              📤 Export All Data
            </button>
            <button 
              onClick={handleImportData}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              📥 Import Data
            </button>
            <button 
              onClick={handleClearData}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        <div className="setting-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">About</h3>
          <div className="setting-info text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">Gym Tracker React v2.0.0</p>
            <p>Your personal workout tracking companion built with React and Tailwind CSS.</p>
            <p>Features: Progress tracking, workout templates, exercise library, and dark mode support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;