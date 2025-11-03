import React, { useState, useEffect, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useWorkout } from '../hooks/useWorkout';

const ProgressPage = () => {
  const { getAllWorkouts, getAllExerciseSets } = useDatabase();
  const { getAllWorkoutsData } = useWorkout();
  
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('month');
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    avgWorkoutDuration: 0,
    totalSets: 0,
    favoriteExercises: []
  });
  const [progressData, setProgressData] = useState({
    weeklyWorkouts: [],
    volumeProgress: [],
    exerciseProgress: []
  });
  const [loading, setLoading] = useState(true);

  const timeFilters = [
    { id: 'week', name: 'Last Week' },
    { id: 'month', name: 'Last Month' },
    { id: 'year', name: 'Last Year' }
  ];

  useEffect(() => {
    loadProgressData();
  }, [selectedExercise, selectedTimeFilter]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const [workouts, exerciseSets] = await Promise.all([
        getAllWorkoutsData(),
        getAllExerciseSets()
      ]);

      const filteredData = filterDataByTime(workouts, exerciseSets, selectedTimeFilter);
      const uniqueExercises = [...new Set(exerciseSets.map(set => set.exercise))];
      setExercises(uniqueExercises);

      calculateStats(filteredData.workouts, filteredData.exerciseSets);
      calculateProgressData(filteredData.workouts, filteredData.exerciseSets);
    } catch (err) {
      console.error('Failed to load progress data:', err);
      if (window.showNotification) {
        window.showNotification('Failed to load progress data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDataByTime = (workouts, exerciseSets, timeFilter) => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return { workouts, exerciseSets };
    }

    const filteredWorkouts = workouts.filter(workout => 
      new Date(workout.date) >= filterDate
    );
    
    const workoutIds = new Set(filteredWorkouts.map(w => w.id));
    const filteredExerciseSets = exerciseSets.filter(set => 
      workoutIds.has(set.workoutId)
    );

    return { workouts: filteredWorkouts, exerciseSets: filteredExerciseSets };
  };

  const calculateStats = (workouts, exerciseSets) => {
    const totalWorkouts = workouts.length;
    const totalVolume = exerciseSets.reduce((sum, set) => 
      sum + (set.weight * set.reps * set.sets), 0
    );
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgWorkoutDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0;
    const totalSets = exerciseSets.length;

    // Calculate favorite exercises
    const exerciseCount = {};
    exerciseSets.forEach(set => {
      exerciseCount[set.exercise] = (exerciseCount[set.exercise] || 0) + 1;
    });
    const favoriteExercises = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    setStats({
      totalWorkouts,
      totalVolume,
      avgWorkoutDuration,
      totalSets,
      favoriteExercises
    });
  };

  const calculateProgressData = (workouts, exerciseSets) => {
    // Weekly workouts data
    const weeklyData = {};
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { week: weekKey, workouts: 0, volume: 0 };
      }
      weeklyData[weekKey].workouts += 1;
    });

    // Volume progress
    exerciseSets.forEach(set => {
      const volume = set.weight * set.reps * set.sets;
      const date = new Date(set.date);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (weeklyData[weekKey]) {
        weeklyData[weekKey].volume += volume;
      }
    });

    const weeklyWorkouts = Object.values(weeklyData)
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-12); // Last 12 weeks

    setProgressData({
      weeklyWorkouts,
      volumeProgress: weeklyWorkouts,
      exerciseProgress: []
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatVolume = (volume) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}t`;
    }
    return `${volume}kg`;
  };

  if (loading) {
    return (
      <div className="page p-6">
        <div className="text-center">
          <div className="text-gray-500">Loading progress data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Exercise Filter</label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Exercises</option>
            {exercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time Period</label>
          <select
            value={selectedTimeFilter}
            onChange={(e) => setSelectedTimeFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {timeFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="progress-stats grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="stat-value text-3xl font-bold text-primary-600 mb-2">
            {stats.totalWorkouts}
          </div>
          <div className="stat-label text-sm text-gray-600">Total Workouts</div>
        </div>
        
        <div className="stat-card bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="stat-value text-3xl font-bold text-green-600 mb-2">
            {formatVolume(stats.totalVolume)}
          </div>
          <div className="stat-label text-sm text-gray-600">Total Volume</div>
        </div>
        
        <div className="stat-card bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="stat-value text-3xl font-bold text-purple-600 mb-2">
            {stats.avgWorkoutDuration}
          </div>
          <div className="stat-label text-sm text-gray-600">Avg Duration (min)</div>
        </div>
        
        <div className="stat-card bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="stat-value text-3xl font-bold text-orange-600 mb-2">
            {stats.totalSets}
          </div>
          <div className="stat-label text-sm text-gray-600">Total Sets</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container space-y-6">
        {/* Weekly Workouts Chart */}
        <div className="chart-section bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Weekly Workout Frequency</h3>
          <div className="chart-placeholder bg-gray-50 h-64 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">
                Weekly workout chart would be displayed here
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Data: {progressData.weeklyWorkouts.length} weeks
              </p>
            </div>
          </div>
        </div>

        {/* Volume Progress Chart */}
        <div className="chart-section bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Weekly Volume Progress</h3>
          <div className="chart-placeholder bg-gray-50 h-64 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-600">
                Volume progression chart would be displayed here
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Peak volume: {Math.max(...progressData.weeklyWorkouts.map(w => w.volume), 0)}kg
              </p>
            </div>
          </div>
        </div>

        {/* Favorite Exercises */}
        <div className="chart-section bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Favorite Exercises</h3>
          {stats.favoriteExercises.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🏋️</div>
              <p className="text-gray-600">No exercise data available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.favoriteExercises.map(([exercise, count], index) => (
                <div key={exercise} className="exercise-progress-item flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="exercise-rank w-6 h-6 rounded-full bg-primary-600 text-white text-sm flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{exercise}</span>
                  </div>
                  <div className="exercise-count text-primary-600 font-semibold">
                    {count} times
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="chart-section bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
          <div className="summary-grid grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="summary-card text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="summary-icon text-2xl mb-2">🎯</div>
              <div className="summary-value text-xl font-bold text-blue-600">
                {progressData.weeklyWorkouts.length > 0 
                  ? Math.round(progressData.weeklyWorkouts.reduce((sum, w) => sum + w.workouts, 0) / progressData.weeklyWorkouts.length)
                  : 0
                }
              </div>
              <div className="summary-label text-sm text-blue-700">Avg Workouts/Week</div>
            </div>
            
            <div className="summary-card text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="summary-icon text-2xl mb-2">💪</div>
              <div className="summary-value text-xl font-bold text-green-600">
                {progressData.weeklyWorkouts.length > 0 
                  ? Math.round(progressData.weeklyWorkouts.reduce((sum, w) => sum + w.volume, 0) / progressData.weeklyWorkouts.length)
                  : 0
                } kg
              </div>
              <div className="summary-label text-sm text-green-700">Avg Volume/Week</div>
            </div>
            
            <div className="summary-card text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="summary-icon text-2xl mb-2">🔥</div>
              <div className="summary-value text-xl font-bold text-purple-600">
                {progressData.weeklyWorkouts.length > 0 ? stats.favoriteExercises[0]?.[0] || 'N/A' : 'N/A'}
              </div>
              <div className="summary-label text-sm text-purple-700">Top Exercise</div>
            </div>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {stats.totalWorkouts === 0 && (
        <div className="empty-state text-center py-12">
          <div className="empty-icon text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">No Progress Data Yet</h3>
          <p className="text-gray-600 mb-4">
            Complete some workouts to see your progress charts and analytics.
          </p>
          <button
            onClick={() => {
              if (window.showNotification) {
                window.showNotification('Start a workout to begin tracking progress!', 'info');
              }
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Start Workout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;