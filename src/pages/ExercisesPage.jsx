import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';

const ExercisesPage = () => {
  const { getExercisesByCategory, addCustomExercise } = useDatabase();
  const [exercises, setExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: 'chest',
    description: ''
  });

  const categories = [
    { id: 'all', name: 'All Exercises' },
    { id: 'chest', name: 'Chest' },
    { id: 'back', name: 'Back' },
    { id: 'legs', name: 'Legs' },
    { id: 'shoulders', name: 'Shoulders' },
    { id: 'arms', name: 'Arms' },
    { id: 'core', name: 'Core' },
    { id: 'custom', name: 'Custom' }
  ];

  useEffect(() => {
    loadExercises();
  }, [selectedCategory]);

  const loadExercises = async () => {
    try {
      const exerciseList = await getExercisesByCategory(selectedCategory);
      setExercises(exerciseList);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    }
  };

  const handleAddExercise = async () => {
    if (!newExercise.name.trim()) {
      if (window.showNotification) {
        window.showNotification('Exercise name is required', 'error');
      }
      return;
    }

    try {
      await addCustomExercise(newExercise.name, newExercise.category, newExercise.description);
      setNewExercise({ name: '', category: 'chest', description: '' });
      setShowAddForm(false);
      
      if (window.showNotification) {
        window.showNotification('Exercise added successfully!', 'success');
      }
      
      loadExercises();
    } catch (err) {
      console.error('Failed to add exercise:', err);
      if (window.showNotification) {
        window.showNotification('Failed to add exercise', 'error');
      }
    }
  };

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Library</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            + Add Exercise
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-exercise-form bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Exercise</h3>
          <div className="form-group mb-4">
            <label className="block text-sm font-medium mb-2">Exercise Name</label>
            <input
              type="text"
              value={newExercise.name}
              onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
              placeholder="e.g., Push-ups"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={newExercise.category}
              onChange={(e) => setNewExercise({...newExercise, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="shoulders">Shoulders</option>
              <option value="arms">Arms</option>
              <option value="core">Core</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={newExercise.description}
              onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
              placeholder="Brief description..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="form-actions flex gap-3">
            <button 
              onClick={handleAddExercise}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Add Exercise
            </button>
            <button 
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="category-filters mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="exercise-list space-y-3">
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <div className="empty-icon text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-semibold mb-2">No Exercises Found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'No exercises available yet.' 
                : `No exercises found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
              }
            </p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-item bg-white p-4 rounded-lg shadow-sm border">
              <div className="exercise-header flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{exercise.name}</h3>
                {exercise.isCustom && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Custom
                  </span>
                )}
              </div>
              <div className="exercise-meta">
                <span className="inline-block bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full mr-2">
                  {categories.find(c => c.id === exercise.category)?.name || exercise.category}
                </span>
                {exercise.description && (
                  <p className="text-gray-600 text-sm mt-2">{exercise.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExercisesPage;