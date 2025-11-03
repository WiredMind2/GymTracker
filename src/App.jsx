import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import Layout from './components/layout/Layout';
import WorkoutPage from './pages/WorkoutPage';
import TemplatesPage from './pages/TemplatesPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import ExercisesPage from './pages/ExercisesPage';
import SettingsPage from './pages/SettingsPage';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('workout');

  // Handle URL parameters for deep linking
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'start-workout') {
      setCurrentPage('workout');
    } else if (action === 'view-history') {
      setCurrentPage('history');
    } else if (action === 'view-progress') {
      setCurrentPage('progress');
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'workout':
        return <WorkoutPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'history':
        return <HistoryPage />;
      case 'progress':
        return <ProgressPage />;
      case 'exercises':
        return <ExercisesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WorkoutPage />;
    }
  };

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <div className="app">
          <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
            {renderPage()}
          </Layout>
          <LoadingScreen />
        </div>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}

export default App;
