import React, { useState, useEffect } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import { useTimer } from '../hooks/useTimer';
import { useDatabase } from '../context/DatabaseContext';

const WorkoutPage = () => {
  const {
    isInitialized,
    error: dbError,
    getExercisesByCategory
  } = useDatabase();

  const {
    currentWorkout,
    currentExercises,
    isLoading: workoutLoading,
    error: workoutError,
    startWorkout,
    endWorkout,
    loadCurrentWorkout,
    addExerciseToWorkout
  } = useWorkout();

  const {
    time: timerTime,
    isRunning: timerRunning,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime
  } = useTimer();

  const [exercises, setExercises] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({
    exerciseName: '',
    weight: '',
    reps: '',
    sets: '3',
    notes: ''
  });

  // Initialize timer for workout
  useEffect(() => {
    if (currentWorkout && currentWorkout.startedAt) {
      const startTime = new Date(currentWorkout.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed > 0) {
        // Set initial timer time but don't start automatically
        resetTimer();
      }
    }
  }, [currentWorkout, resetTimer]);

  // Load exercises on component mount
  useEffect(() => {
    if (isInitialized) {
      loadExercises();
      loadCurrentWorkout();
    }
  }, [isInitialized, loadCurrentWorkout]);

  const loadExercises = async () => {
    try {
      const exerciseList = await getExercisesByCategory('all');
      setExercises(exerciseList);
    } catch (err) {
      console.error('Failed to load exercises:', err);
      if (window.showNotification) {
        window.showNotification('Failed to load exercises', 'error');
      }
    }
  };

  const handleStartWorkout = async () => {
    try {
      await startWorkout();
      startTimer(); // Start the timer when workout starts
      if (window.showNotification) {
        window.showNotification('Workout started successfully!', 'success');
      }
    } catch (err) {
      if (window.showNotification) {
        window.showNotification('Failed to start workout', 'error');
      }
    }
  };

  const handleEndWorkout = async () => {
    try {
      stopTimer();
      await endWorkout();
      resetTimer();
      if (window.showNotification) {
        window.showNotification('Workout saved successfully!', 'success');
      }
    } catch (err) {
      if (window.showNotification) {
        window.showNotification('Failed to save workout', 'error');
      }
    }
  };

  const handleAddExercise = async () => {
    const { exerciseName, weight, reps, sets, notes } = exerciseForm;
    if (!exerciseName || !weight || !reps || !sets) {
      if (window.showNotification) {
        window.showNotification('Please fill in all required fields', 'error');
      }
      return;
    }

    try {
      await addExerciseToWorkout(exerciseForm);
      
      // Reset form
      setExerciseForm({
        exerciseName: '',
        weight: '',
        reps: '',
        sets: '3',
        notes: ''
      });
      
      if (window.showNotification) {
        window.showNotification('Exercise added successfully!', 'success');
      }
    } catch (err) {
      if (window.showNotification) {
        window.showNotification(err.message || 'Failed to add exercise', 'error');
      }
    }
  };

  if (dbError) {
    return (
      <div className="page p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {dbError.message}</div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="page p-6">
        <div className="text-center">
          <div className="loading">Initializing database...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Start Workout</h2>
        <div className="workout-actions flex gap-3">
          {!currentWorkout ? (
            <button 
              onClick={handleStartWorkout}
              disabled={workoutLoading}
              className="btn btn-primary"
            >
              {workoutLoading ? 'Starting...' : 'New Workout'}
            </button>
          ) : (
            <button 
              onClick={handleEndWorkout}
              disabled={workoutLoading}
              className="btn btn-secondary"
            >
              {workoutLoading ? 'Saving...' : 'End Workout'}
            </button>
          )}
        </div>
      </div>

      {currentWorkout ? (
        <div className="workout-section">
          <div className="workout-info">
            <div className="workout-duration">
              <span className="workout-timer text-xl font-bold text-primary-600">
                {formatTime(timerTime)}
              </span>
            </div>
          </div>

          <div className="exercise-form card">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">Add Exercise</h3>
              <div className="form-group mb-4">
                <label className="block text-sm font-medium mb-2">Exercise</label>
                <select
                  value={exerciseForm.exerciseName}
                  onChange={(e) => setExerciseForm({...exerciseForm, exerciseName: e.target.value})}
                  className="form-select"
                >
                  <option value="">Select an exercise...</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.name}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={exerciseForm.weight}
                    onChange={(e) => setExerciseForm({...exerciseForm, weight: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reps</label>
                  <input
                    type="number"
                    min="1"
                    value={exerciseForm.reps}
                    onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={exerciseForm.sets}
                    onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm({...exerciseForm, notes: e.target.value})}
                  placeholder="How did it feel? Any notes..."
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={handleAddExercise}
                  disabled={workoutLoading}
                  className="btn btn-primary"
                >
                  {workoutLoading ? 'Adding...' : 'Add Exercise'}
                </button>
              </div>
            </div>
          </div>

          <div className="workout-sets">
            <h3 className="text-lg font-semibold mb-4">Current Exercises</h3>
            <div className="exercise-list">
              {currentExercises.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏋️</div>
                  <p className="text-gray-500 italic">No exercises added yet</p>
                </div>
              ) : (
                currentExercises.map((set) => (
                  <div key={set.id} className="exercise-card">
                    <div className="exercise-card-header">
                      <div className="exercise-card-title">{set.exercise}</div>
                    </div>
                    <div className="exercise-details grid grid-cols-3 gap-4">
                      <div className="exercise-detail text-center">
                        <span className="exercise-detail-value block text-lg font-bold text-primary-600">
                          {set.weight}
                        </span>
                        <span className="exercise-detail-label block text-xs text-gray-500 uppercase">
                          kg
                        </span>
                      </div>
                      <div className="exercise-detail text-center">
                        <span className="exercise-detail-value block text-lg font-bold text-primary-600">
                          {set.reps}
                        </span>
                        <span className="exercise-detail-label block text-xs text-gray-500 uppercase">
                          reps
                        </span>
                      </div>
                      <div className="exercise-detail text-center">
                        <span className="exercise-detail-value block text-lg font-bold text-primary-600">
                          {set.sets}
                        </span>
                        <span className="exercise-detail-label block text-xs text-gray-500 uppercase">
                          sets
                        </span>
                      </div>
                    </div>
                    {set.notes && (
                      <div className="exercise-notes mt-2 text-sm text-gray-600">
                        {set.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rest Timer Section */}
          <div className="rest-timer-section">
            <h3 className="text-lg font-semibold mb-4">Rest Timer</h3>
            <div className="rest-timer-controls">
              <button 
                onClick={() => {
                  // Set timer to 60 seconds (this would need rest timer logic)
                  if (window.showNotification) {
                    window.showNotification('Rest timer functionality coming soon!', 'info');
                  }
                }}
                className="timer-btn"
              >
                60s
              </button>
              <button 
                onClick={() => {
                  if (window.showNotification) {
                    window.showNotification('Rest timer functionality coming soon!', 'info');
                  }
                }}
                className="timer-btn"
              >
                90s
              </button>
              <button 
                onClick={() => {
                  if (window.showNotification) {
                    window.showNotification('Rest timer functionality coming soon!', 'info');
                  }
                }}
                className="timer-btn"
              >
                120s
              </button>
            </div>
            <div className="timer-display">02:00</div>
            <div className="timer-controls">
              <button className="btn btn-primary">Start</button>
              <button className="btn btn-secondary">Stop</button>
              <button className="btn btn-secondary">Reset</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state text-center py-12">
          <div className="empty-icon text-4xl mb-4">🏋️</div>
          <h3 className="text-xl font-semibold mb-2">No Active Workout</h3>
          <p className="text-gray-600">Start a new workout to begin tracking your session.</p>
        </div>
      )}

      {workoutError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{workoutError}</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;