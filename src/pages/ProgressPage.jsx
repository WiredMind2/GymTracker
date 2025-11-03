import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useWorkout } from '../hooks/useWorkout';

// Simple SVG chart components
const BarChart = ({ data, width = 400, height = 200, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = width / data.length;
  const scale = (height - 40) / maxValue;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((item, index) => {
        const barHeight = item.value * scale;
        const x = index * barWidth;
        const y = height - barHeight - 20;
        
        return (
          <g key={index}>
            <rect
              x={x + 2}
              y={y}
              width={barWidth - 4}
              height={barHeight}
              fill={color}
              opacity="0.8"
              rx="2"
            />
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {item.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
              fontWeight="bold"
            >
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const LineChart = ({ data, width = 400, height = 200, color = '#10b981' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const scaleX = width / (data.length - 1);
  const scaleY = (height - 40) / range;
  
  const points = data.map((item, index) => {
    const x = index * scaleX;
    const y = height - ((item.value - minValue) * scaleY) - 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = height - (ratio * (height - 40)) - 20;
        return (
          <line
            key={index}
            x1="0"
            y1={y}
            x2={width}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Points */}
      {data.map((item, index) => {
        const x = index * scaleX;
        const y = height - ((item.value - minValue) * scaleY) - 20;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="3"
            fill={color}
          />
        );
      })}
      
      {/* Labels */}
      {data.map((item, index) => {
        const x = index * scaleX;
        return (
          <text
            key={index}
            x={x}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
};

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

    // Format data for charts
    const weeklyChartData = weeklyWorkouts.map(w => ({
      label: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: w.workouts
    }));

    const volumeChartData = weeklyWorkouts.map(w => ({
      label: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(w.volume)
    }));

    setProgressData({
      weeklyWorkouts,
      volumeProgress: volumeChartData,
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h2>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Exercise Filter</label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            className="w-full p-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
        <div className="stat-card bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 text-center">
          <div className="stat-value text-3xl font-bold text-primary-600 mb-2">
            {stats.totalWorkouts}
          </div>
          <div className="stat-label text-sm text-gray-600 dark:text-gray-400">Total Workouts</div>
        </div>
        
        <div className="stat-card bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 text-center">
          <div className="stat-value text-3xl font-bold text-green-600 mb-2">
            {formatVolume(stats.totalVolume)}
          </div>
          <div className="stat-label text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
        </div>
        
        <div className="stat-card bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 text-center">
          <div className="stat-value text-3xl font-bold text-purple-600 mb-2">
            {stats.avgWorkoutDuration}
          </div>
          <div className="stat-label text-sm text-gray-600 dark:text-gray-400">Avg Duration (min)</div>
        </div>
        
        <div className="stat-card bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 text-center">
          <div className="stat-value text-3xl font-bold text-orange-600 mb-2">
            {stats.totalSets}
          </div>
          <div className="stat-label text-sm text-gray-600 dark:text-gray-400">Total Sets</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container space-y-6">
        {/* Weekly Workouts Chart */}
        {progressData.weeklyWorkouts.length > 0 && (
          <div className="chart-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold mb-4">Weekly Workout Frequency</h3>
            <div className="chart-container overflow-x-auto">
              <BarChart 
                data={progressData.weeklyWorkouts.map(w => ({
                  label: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  value: w.workouts
                }))}
                width={350}
                height={200}
                color="#3b82f6"
              />
            </div>
          </div>
        )}

        {/* Volume Progress Chart */}
        {progressData.volumeProgress.length > 0 && (
          <div className="chart-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold mb-4">Weekly Volume Progress</h3>
            <div className="chart-container overflow-x-auto">
              <LineChart 
                data={progressData.volumeProgress}
                width={350}
                height={200}
                color="#10b981"
              />
            </div>
          </div>
        )}

        {/* Favorite Exercises */}
        <div className="chart-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold mb-4">Favorite Exercises</h3>
          {stats.favoriteExercises.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🏋️</div>
              <p className="text-gray-600 dark:text-gray-400">No exercise data available yet</p>
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
        <div className="chart-section bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">
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