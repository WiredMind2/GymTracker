/**
 * IndexedDB Database Layer for Gym Tracker React
 * Adapted from the original db.js to work with React hooks
 */

export class GymTrackerDB {
  constructor() {
    this.dbName = 'GymTrackerDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        console.log('Database upgrade needed');
        
        // Create object stores
        this.createObjectStores();
      };
    });
  }

  // Create object stores
  createObjectStores() {
    // Workouts store
    if (!this.db.objectStoreNames.contains('workouts')) {
      const workoutStore = this.db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
      workoutStore.createIndex('date', 'date', { unique: false });
      workoutStore.createIndex('duration', 'duration', { unique: false });
    }
    
    // Exercise sets store
    if (!this.db.objectStoreNames.contains('exerciseSets')) {
      const setsStore = this.db.createObjectStore('exerciseSets', { keyPath: 'id', autoIncrement: true });
      setsStore.createIndex('workoutId', 'workoutId', { unique: false });
      setsStore.createIndex('exercise', 'exercise', { unique: false });
      setsStore.createIndex('date', 'date', { unique: false });
    }
    
    // Exercise library store
    if (!this.db.objectStoreNames.contains('exercises')) {
      const exercisesStore = this.db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
      exercisesStore.createIndex('category', 'category', { unique: false });
      exercisesStore.createIndex('name', 'name', { unique: false });
      exercisesStore.createIndex('isCustom', 'isCustom', { unique: false });
    }
    
    // Pre-built workouts store
    if (!this.db.objectStoreNames.contains('preBuiltWorkouts')) {
      const templatesStore = this.db.createObjectStore('preBuiltWorkouts', { keyPath: 'id', autoIncrement: true });
      templatesStore.createIndex('category', 'category', { unique: false });
      templatesStore.createIndex('name', 'name', { unique: false });
      templatesStore.createIndex('isCustom', 'isCustom', { unique: false });
    }
    
    // Settings store
    if (!this.db.objectStoreNames.contains('settings')) {
      const settingsStore = this.db.createObjectStore('settings', { keyPath: 'key' });
    }
  }

  // Generic method to add data
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get all data from a store
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get data by ID
  async getById(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to update data
  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to delete data
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get data by index
  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Specific workout methods
  async addWorkout(workout) {
    const workoutData = {
      ...workout,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    return await this.add('workouts', workoutData);
  }

  async getAllWorkouts() {
    const workouts = await this.getAll('workouts');
    return workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getWorkoutsByDateRange(startDate, endDate) {
    const allWorkouts = await this.getAll('workouts');
    return allWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async updateWorkout(workout) {
    return await this.update('workouts', workout);
  }

  async deleteWorkout(workoutId) {
    // Delete all exercise sets for this workout
    const sets = await this.getExerciseSetsByWorkout(workoutId);
    for (const set of sets) {
      await this.delete('exerciseSets', set.id);
    }
    // Delete the workout
    return await this.delete('workouts', workoutId);
  }

  // Specific exercise set methods
  async addExerciseSet(exerciseSet) {
    const setData = {
      ...exerciseSet,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    return await this.add('exerciseSets', setData);
  }

  async getExerciseSetsByWorkout(workoutId) {
    return await this.getByIndex('exerciseSets', 'workoutId', workoutId);
  }

  async getAllExerciseSets() {
    return await this.getAll('exerciseSets');
  }

  async getExerciseSetsByExercise(exerciseName) {
    return await this.getByIndex('exerciseSets', 'exercise', exerciseName);
  }

  async updateExerciseSet(exerciseSet) {
    return await this.update('exerciseSets', exerciseSet);
  }

  async deleteExerciseSet(setId) {
    return await this.delete('exerciseSets', setId);
  }

  // Specific exercise library methods
  async addExercise(exercise) {
    const exerciseData = {
      ...exercise,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    return await this.add('exercises', exerciseData);
  }

  async getAllExercises() {
    const exercises = await this.getAll('exercises');
    return exercises.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getExercisesByCategory(category) {
    if (category === 'all') {
      return await this.getAllExercises();
    }
    return await this.getByIndex('exercises', 'category', category);
  }

  async getCustomExercises() {
    const allExercises = await this.getAllExercises();
    return allExercises.filter(exercise => exercise.isCustom);
  }

  async getDefaultExercises() {
    const allExercises = await this.getAllExercises();
    return allExercises.filter(exercise => !exercise.isCustom);
  }

  async updateExercise(exercise) {
    return await this.update('exercises', exercise);
  }

  async deleteExercise(exerciseId) {
    return await this.delete('exercises', exerciseId);
  }

  // Specific settings methods
  async setSetting(key, value) {
    const setting = { key, value };
    return await this.update('settings', setting);
  }

  async getSetting(key) {
    const setting = await this.getById('settings', key);
    return setting ? setting.value : null;
  }

  async getAllSettings() {
    const settings = await this.getAll('settings');
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    return settingsObj;
  }

  // Clear all data
  async clearAllData() {
    const stores = ['workouts', 'exerciseSets', 'exercises', 'preBuiltWorkouts', 'settings'];
    
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    console.log('All data cleared');
  }

  // Pre-built workout methods
  async addPreBuiltWorkout(workoutTemplate) {
    const templateData = {
      ...workoutTemplate,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    return await this.add('preBuiltWorkouts', templateData);
  }

  async getAllPreBuiltWorkouts() {
    const templates = await this.getAll('preBuiltWorkouts');
    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPreBuiltWorkoutsByCategory(category) {
    if (category === 'all') {
      return await this.getAllPreBuiltWorkouts();
    }
    return await this.getByIndex('preBuiltWorkouts', 'category', category);
  }

  async getDefaultPreBuiltWorkouts() {
    const allTemplates = await this.getAllPreBuiltWorkouts();
    return allTemplates.filter(template => !template.isCustom);
  }

  async getCustomPreBuiltWorkouts() {
    const allTemplates = await this.getAllPreBuiltWorkouts();
    return allTemplates.filter(template => template.isCustom);
  }

  async updatePreBuiltWorkout(workoutTemplate) {
    return await this.update('preBuiltWorkouts', workoutTemplate);
  }

  async deletePreBuiltWorkout(templateId) {
    return await this.delete('preBuiltWorkouts', templateId);
  }

  async duplicatePreBuiltWorkout(templateId) {
    try {
      const template = await this.getById('preBuiltWorkouts', templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const { id, ...templateData } = template;
      const duplicatedTemplate = {
        ...templateData,
        name: `${templateData.name} (Copy)`,
        createdAt: new Date().toISOString()
      };

      return await this.add('preBuiltWorkouts', duplicatedTemplate);
    } catch (error) {
      console.error('Failed to duplicate pre-built workout:', error);
      throw error;
    }
  }
}