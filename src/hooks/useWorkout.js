import { useState, useCallback } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export const useWorkout = () => {
  const {
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExerciseSet,
    getExerciseSetsByWorkout,
    getAllWorkouts
  } = useDatabase();

  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentExercises, setCurrentExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startWorkout = useCallback(async (name = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const workout = {
        name: name || `Workout ${new Date().toLocaleDateString()}`,
        duration: 0,
        startedAt: new Date().toISOString(),
        exercises: []
      };

      const workoutId = await addWorkout(workout);
      const newWorkout = { ...workout, id: workoutId };
      
      setCurrentWorkout(newWorkout);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentWorkoutId', workoutId.toString());
      
      return newWorkout;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addWorkout]);

  const endWorkout = useCallback(async () => {
    if (!currentWorkout) return null;

    setIsLoading(true);
    setError(null);
    
    try {
      const duration = currentWorkout.startedAt 
        ? Math.floor((Date.now() - new Date(currentWorkout.startedAt).getTime()) / 1000)
        : 0;
      
      const updatedWorkout = { ...currentWorkout, duration };
      await updateWorkout(updatedWorkout);
      
      setCurrentWorkout(null);
      setCurrentExercises([]);
      localStorage.removeItem('currentWorkoutId');
      
      return updatedWorkout;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkout, updateWorkout]);

  const loadCurrentWorkout = useCallback(async () => {
    const savedWorkoutId = localStorage.getItem('currentWorkoutId');
    if (savedWorkoutId) {
      try {
        const sets = await getExerciseSetsByWorkout(parseInt(savedWorkoutId));
        setCurrentExercises(sets);
        // Note: We would need to get the full workout details too
      } catch (err) {
        setError(err.message);
      }
    }
  }, [getExerciseSetsByWorkout]);

  const addExerciseToWorkout = useCallback(async (exerciseData) => {
    if (!currentWorkout) {
      throw new Error('No active workout');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const exerciseSet = {
        workoutId: currentWorkout.id,
        exercise: exerciseData.exerciseName,
        weight: parseFloat(exerciseData.weight),
        reps: parseInt(exerciseData.reps),
        sets: parseInt(exerciseData.sets),
        notes: exerciseData.notes || ''
      };

      await addExerciseSet(exerciseSet);
      
      // Reload current exercises
      const updatedSets = await getExerciseSetsByWorkout(currentWorkout.id);
      setCurrentExercises(updatedSets);
      
      return exerciseSet;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkout, addExerciseSet, getExerciseSetsByWorkout]);

  const getAllWorkoutsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await getAllWorkouts();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAllWorkouts]);

  const deleteWorkoutById = useCallback(async (workoutId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteWorkout(workoutId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [deleteWorkout]);

  return {
    currentWorkout,
    currentExercises,
    isLoading,
    error,
    startWorkout,
    endWorkout,
    loadCurrentWorkout,
    addExerciseToWorkout,
    getAllWorkoutsData,
    deleteWorkoutById
  };
};