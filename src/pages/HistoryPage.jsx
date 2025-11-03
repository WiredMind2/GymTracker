import React, { useState, useEffect } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import { useDatabase } from '../context/DatabaseContext';

const HistoryPage = () => {
  const { getAllWorkoutsData, deleteWorkoutById } = useWorkout();
  const { getExerciseSetsByWorkout } = useDatabase();
  
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', name: 'All Workouts' },
    { id: 'week', name: 'Last Week' },
    { id: 'month', name: 'Last Month' },
    { id: 'year', name: 'Last Year' }
  ];

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, selectedFilter]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const allWorkouts = await getAllWorkoutsData();
      setWorkouts(allWorkouts);
    } catch (err) {
      console.error('Failed to load workouts:', err);
      if (window.showNotification) {
        window.showNotification('Failed to load workout history', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterWorkouts = () => {
    if (selectedFilter === 'all') {
      setFilteredWorkouts(workouts);
      return;
    }

    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedFilter) {
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
        setFilteredWorkouts(workouts);
        return;
    }

    const filtered = workouts.filter(workout => 
      new Date(workout.date) >= filterDate
    );
    setFilteredWorkouts(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const calculateWorkoutStats = (workout) => {
    const sets = workout.exerciseSets || [];
    const totalVolume = sets.reduce((sum, set) => 
      sum + (set.weight * set.reps * set.sets), 0
    );
    const totalSets = sets.length;
    const uniqueExercises = new Set(sets.map(set => set.exercise)).size;
    
    return { totalVolume, totalSets, uniqueExercises };
  };

  const handleViewWorkoutDetails = async (workout) => {
    try {
      const sets = await getExerciseSetsByWorkout(workout.id);
      const workoutWithSets = { ...workout, exerciseSets: sets };
      setWorkoutDetails(workoutWithSets);
    } catch (err) {
      console.error('Failed to load workout details:', err);
      if (window.showNotification) {
        window.showNotification('Failed to load workout details', 'error');
      }
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteWorkoutById(workoutId);
      setWorkouts(workouts.filter(w => w.id !== workoutId));
      if (window.showNotification) {
        window.showNotification('Workout deleted successfully', 'success');
      }
    } catch (err) {
      if (window.showNotification) {
        window.showNotification('Failed to delete workout', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="page p-6">
        <div className="text-center">
          <div className="text-gray-500">Loading workout history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout History</h2>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls mb-6">
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {filters.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.name}
            </option>
          ))}
        </select>
      </div>

      {/* Workout Statistics */}
      {filteredWorkouts.length > 0 && (
        <div className="history-stats grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="stat-value text-2xl font-bold text-primary-600">
              {filteredWorkouts.length}
            </div>
            <div className="stat-label text-sm text-gray-600">Total Workouts</div>
          </div>
          <div className="stat-card bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="stat-value text-2xl font-bold text-green-600">
              {filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60}
            </div>
            <div className="stat-label text-sm text-gray-600">Total Minutes</div>
          </div>
          <div className="stat-card bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="stat-value text-2xl font-bold text-purple-600">
              {filteredWorkouts.length > 0 
                ? Math.round(filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / filteredWorkouts.length / 60)
                : 0
              }
            </div>
            <div className="stat-label text-sm text-gray-600">Avg Duration (min)</div>
          </div>
        </div>
      )}

      {/* Workouts List */}
      <div className="history-list space-y-3">
        {filteredWorkouts.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="empty-icon text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">
              {selectedFilter === 'all' ? 'No Workouts Yet' : `No Workouts in ${filters.find(f => f.id === selectedFilter)?.name}`}
            </h3>
            <p className="text-gray-600">
              {selectedFilter === 'all' 
                ? 'Start your first workout to see it appear here.' 
                : `You haven't done any workouts in the selected time period.`
              }
            </p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const stats = calculateWorkoutStats(workout);
            return (
              <div key={workout.id} className="workout-item bg-white p-4 rounded-lg shadow-sm border">
                <div className="workout-header flex justify-between items-start mb-3">
                  <div className="workout-info">
                    <div className="workout-title font-semibold text-lg">
                      {workout.name || 'Workout Session'}
                    </div>
                    <div className="workout-meta flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(workout.date)}</span>
                      <span>Duration: {formatDuration(workout.duration || 0)}</span>
                    </div>
                  </div>
                  <div className="workout-actions flex gap-2">
                    <button
                      onClick={() => handleViewWorkoutDetails(workout)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="workout-stats grid grid-cols-3 gap-4 text-center">
                  <div className="stat">
                    <div className="stat-value text-lg font-semibold text-primary-600">
                      {stats.uniqueExercises}
                    </div>
                    <div className="stat-label text-xs text-gray-500">Exercises</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value text-lg font-semibold text-green-600">
                      {stats.totalSets}
                    </div>
                    <div className="stat-label text-xs text-gray-500">Sets</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value text-lg font-semibold text-purple-600">
                      {stats.totalVolume.toFixed(0)} kg
                    </div>
                    <div className="stat-label text-xs text-gray-500">Volume</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Workout Details Modal */}
      {workoutDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="modal-header p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{workoutDetails.name || 'Workout Session'}</h3>
                  <p className="text-gray-600 text-sm">{formatDate(workoutDetails.date)}</p>
                </div>
                <button
                  onClick={() => setWorkoutDetails(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="modal-body p-6">
              <div className="workout-summary grid grid-cols-3 gap-4 mb-6">
                <div className="summary-card text-center">
                  <div className="summary-value text-xl font-bold text-primary-600">
                    {workoutDetails.duration ? formatDuration(workoutDetails.duration) : '0m'}
                  </div>
                  <div className="summary-label text-sm text-gray-600">Duration</div>
                </div>
                <div className="summary-card text-center">
                  <div className="summary-value text-xl font-bold text-green-600">
                    {new Set(workoutDetails.exerciseSets?.map(set => set.exercise)).size}
                  </div>
                  <div className="summary-label text-sm text-gray-600">Exercises</div>
                </div>
                <div className="summary-card text-center">
                  <div className="summary-value text-xl font-bold text-purple-600">
                    {workoutDetails.exerciseSets?.length || 0}
                  </div>
                  <div className="summary-label text-sm text-gray-600">Total Sets</div>
                </div>
              </div>

              <div className="exercise-sets-list">
                <h4 className="font-semibold mb-3">Exercise Details</h4>
                <div className="space-y-3">
                  {workoutDetails.exerciseSets?.map((set, index) => (
                    <div key={index} className="set-detail bg-gray-50 p-3 rounded">
                      <div className="set-header flex justify-between items-center mb-2">
                        <span className="font-medium">{set.exercise}</span>
                        <span className="text-sm text-gray-600">
                          {set.notes && `"${set.notes}"`}
                        </span>
                      </div>
                      <div className="set-stats grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="stat-value font-semibold text-primary-600">
                            {set.weight} kg
                          </div>
                          <div className="stat-label text-xs text-gray-500">Weight</div>
                        </div>
                        <div>
                          <div className="stat-value font-semibold text-green-600">
                            {set.reps}
                          </div>
                          <div className="stat-label text-xs text-gray-500">Reps</div>
                        </div>
                        <div>
                          <div className="stat-value font-semibold text-purple-600">
                            {set.sets}
                          </div>
                          <div className="stat-label text-xs text-gray-500">Sets</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer p-6 border-t">
              <button
                onClick={() => setWorkoutDetails(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;