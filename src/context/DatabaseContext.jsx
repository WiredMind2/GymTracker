import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GymTrackerDB } from '../utils/database';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const gymDB = new GymTrackerDB();
        await gymDB.init();
        setDb(gymDB);
        setIsInitialized(true);
        console.log('Database initialized successfully');
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err);
      }
    };

    initDB();
  }, []);

  // Exercise methods
  const getExercisesByCategory = useCallback(async (category = 'all') => {
    if (!db) return [];
    try {
      if (category === 'all') {
        return await db.getAllExercises();
      } else if (category === 'custom') {
        return await db.getCustomExercises();
      } else {
        return await db.getExercisesByCategory(category);
      }
    } catch (err) {
      console.error('Failed to get exercises by category:', err);
      return [];
    }
  }, [db]);

  const searchExercises = useCallback(async (query, category = 'all') => {
    const exercises = await getExercisesByCategory(category);
    const lowercaseQuery = query.toLowerCase();
    
    return exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(lowercaseQuery) ||
      exercise.description?.toLowerCase().includes(lowercaseQuery) ||
      exercise.muscleGroups?.some(muscle => muscle.toLowerCase().includes(lowercaseQuery))
    );
  }, [getExercisesByCategory]);

  const addCustomExercise = useCallback(async (name, category, description = '') => {
    if (!db) throw new Error('Database not initialized');
    
    const exercise = {
      name,
      category,
      description,
      muscleGroups: [],
      equipment: 'bodyweight',
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    return await db.addExercise(exercise);
  }, [db]);

  // Workout methods
  const getAllWorkouts = useCallback(async () => {
    if (!db) return [];
    return await db.getAllWorkouts();
  }, [db]);

  const getWorkoutsByDateRange = useCallback(async (startDate, endDate) => {
    if (!db) return [];
    return await db.getWorkoutsByDateRange(startDate, endDate);
  }, [db]);

  const addWorkout = useCallback(async (workout) => {
    if (!db) throw new Error('Database not initialized');
    return await db.addWorkout(workout);
  }, [db]);

  const updateWorkout = useCallback(async (workout) => {
    if (!db) throw new Error('Database not initialized');
    return await db.updateWorkout(workout);
  }, [db]);

  const deleteWorkout = useCallback(async (workoutId) => {
    if (!db) throw new Error('Database not initialized');
    return await db.deleteWorkout(workoutId);
  }, [db]);

  // Exercise Set methods
  const addExerciseSet = useCallback(async (exerciseSet) => {
    if (!db) throw new Error('Database not initialized');
    return await db.addExerciseSet(exerciseSet);
  }, [db]);

  const getExerciseSetsByWorkout = useCallback(async (workoutId) => {
    if (!db) return [];
    return await db.getExerciseSetsByWorkout(workoutId);
  }, [db]);

  const getAllExerciseSets = useCallback(async () => {
    if (!db) return [];
    return await db.getAllExerciseSets();
  }, [db]);

  const deleteExerciseSet = useCallback(async (setId) => {
    if (!db) throw new Error('Database not initialized');
    return await db.deleteExerciseSet(setId);
  }, [db]);

  // Settings methods
  const getSetting = useCallback(async (key) => {
    if (!db) return null;
    return await db.getSetting(key);
  }, [db]);

  const setSetting = useCallback(async (key, value) => {
    if (!db) throw new Error('Database not initialized');
    return await db.setSetting(key, value);
  }, [db]);

  const getAllSettings = useCallback(async () => {
    if (!db) return {};
    return await db.getAllSettings();
  }, [db]);

  // Template methods
  const getAllTemplates = useCallback(async () => {
    if (!db) return [];
    return await db.getAllPreBuiltWorkouts();
  }, [db]);

  const getTemplatesByCategory = useCallback(async (category) => {
    if (!db) return [];
    return await db.getPreBuiltWorkoutsByCategory(category);
  }, [db]);

  const getPreBuiltWorkoutsByCategory = useCallback(async (category) => {
    if (!db) return [];
    return await db.getPreBuiltWorkoutsByCategory(category);
  }, [db]);

  const addTemplate = useCallback(async (template) => {
    if (!db) throw new Error('Database not initialized');
    return await db.addPreBuiltWorkout(template);
  }, [db]);

  const addPreBuiltWorkout = useCallback(async (template) => {
    if (!db) throw new Error('Database not initialized');
    return await db.addPreBuiltWorkout(template);
  }, [db]);

  const deleteTemplate = useCallback(async (templateId) => {
    if (!db) throw new Error('Database not initialized');
    return await db.deletePreBuiltWorkout(templateId);
  }, [db]);

  const deletePreBuiltWorkout = useCallback(async (templateId) => {
    if (!db) throw new Error('Database not initialized');
    return await db.deletePreBuiltWorkout(templateId);
  }, [db]);

  const duplicateTemplate = useCallback(async (templateId) => {
    if (!db) throw new Error('Database not initialized');
    return await db.duplicatePreBuiltWorkout(templateId);
  }, [db]);

  const duplicatePreBuiltWorkout = useCallback(async (templateId) => {
    if (!db) throw new Error('Database not initialized');
    return await db.duplicatePreBuiltWorkout(templateId);
  }, [db]);

  // Data management
  const clearAllData = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    return await db.clearAllData();
  }, [db]);

  const exportData = useCallback(async () => {
    if (!db) throw new Error('Database not initialized');
    
    const workouts = await db.getAllWorkouts();
    const exerciseSets = await db.getAllExerciseSets();
    const exercises = await db.getAllExercises();
    const templates = await db.getAllPreBuiltWorkouts();
    const settings = await db.getAllSettings();
    
    return {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      data: {
        workouts,
        exerciseSets,
        exercises,
        templates,
        settings
      }
    };
  }, [db]);

  const importData = useCallback(async (importData) => {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const { workouts, exerciseSets, exercises, templates, settings } = importData.data;
      
      // Import custom exercises only (skip default ones)
      for (const exercise of exercises) {
        if (exercise.isCustom) {
          const { id, ...exerciseData } = exercise;
          await db.add('exercises', exerciseData);
        }
      }
      
      // Import custom templates only
      for (const template of templates) {
        if (template.isCustom) {
          const { id, ...templateData } = template;
          await db.add('preBuiltWorkouts', templateData);
        }
      }
      
      // Import settings
      for (const [key, value] of Object.entries(settings)) {
        await db.setSetting(key, value);
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }, [db]);

  const value = {
    // State
    db,
    isInitialized,
    error,
    
    // Exercise methods
    getExercisesByCategory,
    searchExercises,
    addCustomExercise,
    
    // Workout methods
    getAllWorkouts,
    getWorkoutsByDateRange,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    
    // Exercise Set methods
    addExerciseSet,
    getExerciseSetsByWorkout,
    getAllExerciseSets,
    deleteExerciseSet,
    
    // Settings methods
    getSetting,
    setSetting,
    getAllSettings,
    
    // Template methods
    getAllTemplates,
    getTemplatesByCategory,
    getPreBuiltWorkoutsByCategory,
    addTemplate,
    addPreBuiltWorkout,
    deleteTemplate,
    deletePreBuiltWorkout,
    duplicateTemplate,
    duplicatePreBuiltWorkout,
    
    // Data management
    clearAllData,
    exportData,
    importData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};