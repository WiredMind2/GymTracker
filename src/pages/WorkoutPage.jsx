import React, { useState, useEffect } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import { useTimer } from '../hooks/useTimer';
import { useDatabase } from '../context/DatabaseContext';

const WorkoutPage = () => {
  const {
    isInitialized,
    error: dbError,
    getExercisesByCategory,
    getPreBuiltWorkoutsByCategory
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
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
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

  // Load exercises and templates on component mount
  useEffect(() => {
    if (isInitialized) {
      loadExercises();
      loadTemplates();
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

  const loadTemplates = async () => {
    try {
      const templateList = await getPreBuiltWorkoutsByCategory('all');
      setTemplates(templateList);
    } catch (err) {
      console.error('Failed to load templates:', err);
      if (window.showNotification) {
        window.showNotification('Failed to load templates', 'error');
      }
    }
  };

  const handleStartWorkout = async (templateId = null) => {
    try {
      if (templateId) {
        const template = templates.find(t => t.id === templateId);
        const workoutName = template ? `${template.name} - ${new Date().toLocaleDateString()}` : null;
        await startWorkout(workoutName);
        
        // Add all exercises from template
        if (template && template.exercises) {
          for (const exercise of template.exercises) {
            const exerciseData = {
              exerciseName: exercise.name,
              weight: exercise.weight || 0,
              reps: exercise.reps || 10,
              sets: exercise.sets || 3,
              notes: exercise.notes || ''
            };
            await addExerciseToWorkout(exerciseData);
          }
        }
      } else {
        await startWorkout();
      }
      
      startTimer(); // Start the timer when workout starts
      setShowTemplateSelection(false);
      setSelectedTemplate(null);
      
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
      setShowTemplateSelection(false);
      setSelectedTemplate(null);
      
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

  const handleRemoveExercise = async (setId) => {
    // This would need to be implemented in the useWorkout hook
    if (window.showNotification) {
      window.showNotification('Remove exercise functionality coming soon!', 'info');
    }
  };

  const handleSetRestTimer = (seconds) => {
    // Simple rest timer functionality
    if (timerRunning) {
      stopTimer();
    }
    resetTimer();
    
    let remaining = seconds;
    const timer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(timer);
        if (window.showNotification) {
          window.showNotification('Rest timer finished!', 'success');
        }
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }, 1000);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'push': '💪',
      'pull': '🏋️',
      'legs': '🦵',
      'full-body': '🔥',
      'strength': '💪',
      'hypertrophy': '🎯',
      'core': '🧘',
      'cardio': '🏃'
    };
    return icons[category] || '🏋️';
  };

  if (dbError) {
    return (
      <div className="page p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {dbError.message}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
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
          <div className="text-gray-500">Initializing database...</div>
        </div>
      </div>
    );
  }

  // Template Selection Screen
  if (!currentWorkout && showTemplateSelection) {
    return (
      <div className="page p-6">
        <div className="page-header mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Workout Template</h2>
            <button
              onClick={() => setShowTemplateSelection(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="template-selection space-y-6">
          {/* Quick Start Option */}
          <div className="template-option bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="template-icon text-4xl">🏋️</div>
              <div className="template-info flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start Blank Workout</h3>
                <p className="text-gray-600 text-sm">Create your own workout from scratch</p>
              </div>
              <button
                onClick={() => handleStartWorkout()}
                disabled={workoutLoading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {workoutLoading ? 'Starting...' : 'Start Now'}
              </button>
            </div>
          </div>

          {/* Template Grid */}
          <div className="template-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold mb-2">No Templates Available</h3>
                <p className="text-gray-600 mb-4">Create workout templates in the Templates page to get started.</p>
                <button
                  onClick={() => {
                    setShowTemplateSelection(false);
                    // You could add navigation to templates page here
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Create Templates
                </button>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card bg-white p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded-full capitalize">
                          {template.category}
                        </span>
                        <span>•</span>
                        <span>{template.exercises?.length || 0} exercises</span>
                        <span>•</span>
                        <span>~{template.estimatedDuration}min</span>
                      </div>
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  )}
                  
                  <div className="exercises-preview">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">EXERCISES</h4>
                    <div className="space-y-1">
                      {template.exercises?.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="text-xs text-gray-600 flex justify-between">
                          <span>{exercise.name}</span>
                          <span>{exercise.sets}x{exercise.reps}</span>
                        </div>
                      ))}
                      {template.exercises?.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{template.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Template Actions */}
          {selectedTemplate && (
            <div className="selected-template-action bg-white p-6 rounded-lg shadow-sm border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(selectedTemplate.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedTemplate.exercises?.length || 0} exercises • ~{selectedTemplate.estimatedDuration}min
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartWorkout(selectedTemplate.id)}
                  disabled={workoutLoading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {workoutLoading ? 'Starting...' : 'Use Template'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout</h2>
        <div className="workout-actions flex gap-3 mt-4">
          {!currentWorkout ? (
            <button 
              onClick={() => setShowTemplateSelection(true)}
              disabled={workoutLoading}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              📋 Choose Template
            </button>
          ) : (
            <button 
              onClick={handleEndWorkout}
              disabled={workoutLoading}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {workoutLoading ? 'Saving...' : '✅ End Workout'}
            </button>
          )}
        </div>
      </div>

      {currentWorkout ? (
        <div className="workout-section space-y-6">
          <div className="workout-info bg-white p-4 rounded-lg shadow-sm border">
            <div className="workout-duration text-center">
              <span className="workout-timer text-3xl font-bold text-primary-600">
                {formatTime(timerTime)}
              </span>
              <p className="text-sm text-gray-600 mt-1">Workout Duration</p>
            </div>
          </div>

          <div className="exercise-form bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Add Exercise</h3>
            
            <div className="form-group mb-4">
              <label className="block text-sm font-medium mb-2">Exercise</label>
              <select
                value={exerciseForm.exerciseName}
                onChange={(e) => setExerciseForm({...exerciseForm, exerciseName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reps</label>
                <input
                  type="number"
                  min="1"
                  value={exerciseForm.reps}
                  onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})}
                  placeholder="10"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sets</label>
                <input
                  type="number"
                  min="1"
                  value={exerciseForm.sets}
                  onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})}
                  placeholder="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="form-actions">
              <button 
                onClick={handleAddExercise}
                disabled={workoutLoading}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {workoutLoading ? 'Adding...' : '➕ Add Exercise'}
              </button>
            </div>
          </div>

          <div className="workout-sets bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Current Exercises</h3>
            <div className="exercise-list space-y-3">
              {currentExercises.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏋️</div>
                  <p className="text-gray-500 italic">No exercises added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first exercise above</p>
                </div>
              ) : (
                currentExercises.map((set) => (
                  <div key={set.id} className="exercise-card border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="exercise-card-header mb-3">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{set.exercise}</h4>
                    </div>
                    <div className="exercise-details grid grid-cols-3 gap-4 mb-3">
                      <div className="exercise-detail text-center">
                        <span className="exercise-detail-value block text-xl font-bold text-primary-600">
                          {set.weight}
                        </span>
                        <span className="exercise-detail-label block text-xs text-gray-500 uppercase tracking-wide">
                          kg
                        </span>
                      </div>
                      <div className="exercise-detail text-center">
                        <span className="exercise-detail-value block text-xl font-bold text-primary-600">
                          {set.reps}
                        </span>
                        <span className="exercise-detail-label block text-xs text-gray-500 uppercase tracking-wide">
                          reps
                        </span>
                      </div>
                      <div className="exercise-detail text-center">
                        <span className="exercise-detail-value block text-xl font-bold text-primary-600">
                          {set.sets}
                        </span>
                        <span className="exercise-detail-label block text-xs text-gray-500 uppercase tracking-wide">
                          sets
                        </span>
                      </div>
                    </div>
                    {set.notes && (
                      <div className="exercise-notes mt-3 p-3 bg-white rounded border-l-4 border-primary-500">
                        <p className="text-sm text-gray-700">{set.notes}</p>
                      </div>
                    )}
                    <div className="exercise-actions mt-3 flex justify-end">
                      <button
                        onClick={() => handleRemoveExercise(set.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rest Timer Section */}
          <div className="rest-timer-section bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Rest Timer</h3>
            <div className="rest-timer-controls flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => handleSetRestTimer(60)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                ⏱️ 60s
              </button>
              <button 
                onClick={() => handleSetRestTimer(90)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                ⏱️ 90s
              </button>
              <button 
                onClick={() => handleSetRestTimer(120)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                ⏱️ 120s
              </button>
            </div>
            <div className="timer-display text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {formatTime(timerTime)}
              </div>
              <p className="text-sm text-gray-600">Current Timer</p>
            </div>
            <div className="timer-controls flex justify-center gap-3 mt-4">
              <button 
                onClick={startTimer}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ▶️ Start
              </button>
              <button 
                onClick={stopTimer}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                ⏸️ Stop
              </button>
              <button 
                onClick={resetTimer}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state text-center py-12">
          <div className="empty-icon text-6xl mb-4">🏋️</div>
          <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
          <p className="text-gray-600 mb-6">Choose a template or start with a blank workout.</p>
          <button
            onClick={() => setShowTemplateSelection(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
          >
            📋 Choose Template
          </button>
        </div>
      )}

      {workoutError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{workoutError}</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;