import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';

const TemplatesPage = () => {
  const {
    getPreBuiltWorkoutsByCategory,
    addPreBuiltWorkout,
    deletePreBuiltWorkout,
    duplicatePreBuiltWorkout
  } = useDatabase();

  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'push',
    description: '',
    estimatedDuration: 60,
    exercises: []
  });

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'push', name: 'Push' },
    { id: 'pull', name: 'Pull' },
    { id: 'legs', name: 'Legs' },
    { id: 'full-body', name: 'Full Body' },
    { id: 'strength', name: 'Strength' },
    { id: 'hypertrophy', name: 'Hypertrophy' },
    { id: 'core', name: 'Core' },
    { id: 'cardio', name: 'Cardio' }
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      const templateList = await getPreBuiltWorkoutsByCategory(selectedCategory);
      setTemplates(templateList);
    } catch (err) {
      console.error('Failed to load templates:', err);
      if (window.showNotification) {
        window.showNotification('Failed to load templates', 'error');
      }
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      if (window.showNotification) {
        window.showNotification('Template name is required', 'error');
      }
      return;
    }

    try {
      await addPreBuiltWorkout(newTemplate);
      setNewTemplate({
        name: '',
        category: 'push',
        description: '',
        estimatedDuration: 60,
        exercises: []
      });
      setShowCreateForm(false);
      
      if (window.showNotification) {
        window.showNotification('Template created successfully!', 'success');
      }
      
      loadTemplates();
    } catch (err) {
      console.error('Failed to create template:', err);
      if (window.showNotification) {
        window.showNotification('Failed to create template', 'error');
      }
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deletePreBuiltWorkout(templateId);
      if (window.showNotification) {
        window.showNotification('Template deleted successfully', 'success');
      }
      loadTemplates();
    } catch (err) {
      if (window.showNotification) {
        window.showNotification('Failed to delete template', 'error');
      }
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        exercises: [...template.exercises]
      };
      await addPreBuiltWorkout(duplicatedTemplate);
      
      if (window.showNotification) {
        window.showNotification('Template duplicated successfully', 'success');
      }
      loadTemplates();
    } catch (err) {
      if (window.showNotification) {
        window.showNotification('Failed to duplicate template', 'error');
      }
    }
  };

  const addExerciseToTemplate = () => {
    const newExercise = {
      name: '',
      sets: 3,
      reps: 10,
      notes: ''
    };
    setNewTemplate({
      ...newTemplate,
      exercises: [...newTemplate.exercises, newExercise]
    });
  };

  const updateExerciseInTemplate = (index, field, value) => {
    const updatedExercises = newTemplate.exercises.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    );
    setNewTemplate({ ...newTemplate, exercises: updatedExercises });
  };

  const removeExerciseFromTemplate = (index) => {
    const updatedExercises = newTemplate.exercises.filter((_, i) => i !== index);
    setNewTemplate({ ...newTemplate, exercises: updatedExercises });
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page p-6">
      <div className="page-header mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Workout Templates</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            + Create Template
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Category Filters */}
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

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="create-template-form bg-white p-6 rounded-lg shadow-sm mb-6 border">
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
          
          <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="e.g., Upper Body Push Day"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="push">Push</option>
                <option value="pull">Pull</option>
                <option value="legs">Legs</option>
                <option value="full-body">Full Body</option>
                <option value="strength">Strength</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="core">Core</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
              placeholder="Brief description of this workout template..."
              rows="2"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium mb-2">Estimated Duration (minutes)</label>
            <input
              type="number"
              min="10"
              max="180"
              value={newTemplate.estimatedDuration}
              onChange={(e) => setNewTemplate({...newTemplate, estimatedDuration: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Exercises List */}
          <div className="template-exercises-section mb-4">
            <div className="section-header flex justify-between items-center mb-3">
              <h4 className="font-semibold">Exercises</h4>
              <button
                type="button"
                onClick={addExerciseToTemplate}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                + Add Exercise
              </button>
            </div>
            
            <div className="space-y-3">
              {newTemplate.exercises.map((exercise, index) => (
                <div key={index} className="exercise-row bg-gray-50 p-3 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseInTemplate(index, 'name', e.target.value)}
                      placeholder="Exercise name"
                      className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExerciseInTemplate(index, 'sets', parseInt(e.target.value))}
                      placeholder="Sets"
                      min="1"
                      className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExerciseInTemplate(index, 'reps', parseInt(e.target.value))}
                      placeholder="Reps"
                      min="1"
                      className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => removeExerciseFromTemplate(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={exercise.notes}
                    onChange={(e) => updateExerciseInTemplate(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions flex gap-3">
            <button 
              onClick={handleCreateTemplate}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Create Template
            </button>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="templates-list space-y-3">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="empty-icon text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'No workout templates available yet.' 
                : `No templates found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
              }
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="template-item bg-white p-4 rounded-lg shadow-sm border">
              <div className="template-header flex justify-between items-start mb-2">
                <div className="template-info">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <div className="template-meta">
                    <span className="inline-block bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full mr-2">
                      {categories.find(c => c.id === template.category)?.name || template.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      ~{template.estimatedDuration} min
                    </span>
                    {template.isCustom && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
                <div className="template-actions flex gap-2">
                  <button
                    onClick={() => setShowDetails(template)}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    Duplicate
                  </button>
                  {template.isCustom && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              {template.description && (
                <p className="text-gray-600 text-sm mb-2">{template.description}</p>
              )}
              
              <div className="template-exercises-preview">
                <p className="text-sm text-gray-500">
                  {template.exercises?.length || 0} exercises included
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="modal-header p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{showDetails.name}</h3>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="modal-body p-6">
              <div className="template-info mb-4">
                <p className="text-gray-600 mb-2">{showDetails.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Category: {categories.find(c => c.id === showDetails.category)?.name || showDetails.category}</span>
                  <span>Duration: ~{showDetails.estimatedDuration} min</span>
                </div>
              </div>
              
              <div className="exercises-list">
                <h4 className="font-semibold mb-3">Exercises ({showDetails.exercises?.length || 0})</h4>
                <div className="space-y-2">
                  {showDetails.exercises?.map((exercise, index) => (
                    <div key={index} className="exercise-detail bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{exercise.name}</span>
                        <div className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps} reps
                        </div>
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-gray-500 mt-1">{exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer p-6 border-t">
              <button
                onClick={() => setShowDetails(null)}
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

export default TemplatesPage;