// Exercise Library for Gym Tracker PWA
class ExerciseLibrary {
    constructor() {
        this.defaultExercises = [
            // Chest Exercises
            {
                name: "Bench Press",
                category: "chest",
                description: "Classic barbell bench press for chest development",
                muscleGroups: ["chest", "triceps", "shoulders"],
                equipment: "barbell"
            },
            {
                name: "Incline Bench Press",
                category: "chest",
                description: "Incline press targeting upper chest",
                muscleGroups: ["chest", "triceps", "shoulders"],
                equipment: "barbell"
            },
            {
                name: "Decline Bench Press",
                category: "chest",
                description: "Decline press for lower chest development",
                muscleGroups: ["chest", "triceps", "shoulders"],
                equipment: "barbell"
            },
            {
                name: "Push-ups",
                category: "chest",
                description: "Bodyweight chest exercise",
                muscleGroups: ["chest", "triceps", "shoulders", "core"],
                equipment: "bodyweight"
            },
            {
                name: "Dumbbell Flyes",
                category: "chest",
                description: "Isolation exercise for chest stretch",
                muscleGroups: ["chest"],
                equipment: "dumbbells"
            },
            {
                name: "Cable Flyes",
                category: "chest",
                description: "Cable flyes for constant tension",
                muscleGroups: ["chest"],
                equipment: "cable"
            },
            {
                name: "Dips",
                category: "chest",
                description: "Bodyweight dip for chest and triceps",
                muscleGroups: ["chest", "triceps"],
                equipment: "bodyweight"
            },
            {
                name: "Chest Press Machine",
                category: "chest",
                description: "Machine-based chest press",
                muscleGroups: ["chest", "triceps"],
                equipment: "machine"
            },

            // Back Exercises
            {
                name: "Deadlift",
                category: "back",
                description: "King of all exercises - full posterior chain",
                muscleGroups: ["back", "glutes", "hamstrings", "traps"],
                equipment: "barbell"
            },
            {
                name: "Pull-ups",
                category: "back",
                description: "Bodyweight pull for lats and biceps",
                muscleGroups: ["back", "biceps"],
                equipment: "bodyweight"
            },
            {
                name: "Chin-ups",
                category: "back",
                description: "Underhand pull for lats and biceps",
                muscleGroups: ["back", "biceps"],
                equipment: "bodyweight"
            },
            {
                name: "Bent-over Row",
                category: "back",
                description: "Classic barbell row for back thickness",
                muscleGroups: ["back", "biceps"],
                equipment: "barbell"
            },
            {
                name: "Single-arm Dumbbell Row",
                category: "back",
                description: "One-arm dumbbell row",
                muscleGroups: ["back", "biceps"],
                equipment: "dumbbell"
            },
            {
                name: "Lat Pulldown",
                category: "back",
                description: "Cable pulldown for lats",
                muscleGroups: ["back", "biceps"],
                equipment: "cable"
            },
            {
                name: "Seated Cable Row",
                category: "back",
                description: "Seated row for back thickness",
                muscleGroups: ["back", "biceps"],
                equipment: "cable"
            },
            {
                name: "T-Bar Row",
                category: "back",
                description: "T-bar row for concentrated back workout",
                muscleGroups: ["back", "biceps"],
                equipment: "barbell"
            },

            // Shoulder Exercises
            {
                name: "Overhead Press",
                category: "shoulders",
                description: "Classic military press",
                muscleGroups: ["shoulders", "triceps"],
                equipment: "barbell"
            },
            {
                name: "Dumbbell Shoulder Press",
                category: "shoulders",
                description: "Standing or seated dumbbell press",
                muscleGroups: ["shoulders", "triceps"],
                equipment: "dumbbells"
            },
            {
                name: "Lateral Raises",
                category: "shoulders",
                description: "Side raises for shoulder width",
                muscleGroups: ["shoulders"],
                equipment: "dumbbells"
            },
            {
                name: "Front Raises",
                category: "shoulders",
                description: "Front raises for anterior deltoids",
                muscleGroups: ["shoulders"],
                equipment: "dumbbells"
            },
            {
                name: "Rear Delt Flyes",
                category: "shoulders",
                description: "Reverse flyes for rear deltoids",
                muscleGroups: ["shoulders"],
                equipment: "dumbbells"
            },
            {
                name: "Arnold Press",
                category: "shoulders",
                description: "Rotational shoulder press",
                muscleGroups: ["shoulders", "triceps"],
                equipment: "dumbbells"
            },
            {
                name: "Upright Row",
                category: "shoulders",
                description: "Upright row for traps and delts",
                muscleGroups: ["shoulders", "traps"],
                equipment: "barbell"
            },

            // Legs Exercises
            {
                name: "Squats",
                category: "legs",
                description: "King of leg exercises",
                muscleGroups: ["quads", "glutes", "hamstrings"],
                equipment: "barbell"
            },
            {
                name: "Front Squats",
                category: "legs",
                description: "Front squat for quads emphasis",
                muscleGroups: ["quads", "glutes", "hamstrings"],
                equipment: "barbell"
            },
            {
                name: "Lunges",
                category: "legs",
                description: "Walking lunges for leg development",
                muscleGroups: ["quads", "glutes", "hamstrings"],
                equipment: "bodyweight"
            },
            {
                name: "Bulgarian Split Squats",
                category: "legs",
                description: "Single-leg squat variation",
                muscleGroups: ["quads", "glutes"],
                equipment: "bodyweight"
            },
            {
                name: "Leg Press",
                category: "legs",
                description: "Machine-based leg press",
                muscleGroups: ["quads", "glutes", "hamstrings"],
                equipment: "machine"
            },
            {
                name: "Leg Curl",
                category: "legs",
                description: "Hamstring curl machine",
                muscleGroups: ["hamstrings"],
                equipment: "machine"
            },
            {
                name: "Leg Extension",
                category: "legs",
                description: "Quad extension machine",
                muscleGroups: ["quads"],
                equipment: "machine"
            },
            {
                name: "Calf Raises",
                category: "legs",
                description: "Calf raise exercise",
                muscleGroups: ["calves"],
                equipment: "bodyweight"
            },
            {
                name: "Romanian Deadlift",
                category: "legs",
                description: "Hip hinge movement for hamstrings and glutes",
                muscleGroups: ["hamstrings", "glutes"],
                equipment: "barbell"
            },
            {
                name: "Glute Bridge",
                category: "legs",
                description: "Glute activation exercise",
                muscleGroups: ["glutes"],
                equipment: "bodyweight"
            },

            // Arms Exercises
            {
                name: "Bicep Curls",
                category: "arms",
                description: "Classic bicep curl",
                muscleGroups: ["biceps"],
                equipment: "dumbbells"
            },
            {
                name: "Hammer Curls",
                category: "arms",
                description: "Neutral grip bicep curl",
                muscleGroups: ["biceps", "forearms"],
                equipment: "dumbbells"
            },
            {
                name: "Preacher Curls",
                category: "arms",
                description: "Preacher curl bench exercise",
                muscleGroups: ["biceps"],
                equipment: "dumbbells"
            },
            {
                name: "Concentration Curls",
                category: "arms",
                description: "Single-arm concentration curl",
                muscleGroups: ["biceps"],
                equipment: "dumbbell"
            },
            {
                name: "Tricep Dips",
                category: "arms",
                description: "Tricep dip exercise",
                muscleGroups: ["triceps"],
                equipment: "bodyweight"
            },
            {
                name: "Tricep Pushdowns",
                category: "arms",
                description: "Cable tricep pushdown",
                muscleGroups: ["triceps"],
                equipment: "cable"
            },
            {
                name: "Skull Crushers",
                category: "arms",
                description: "Lying tricep extension",
                muscleGroups: ["triceps"],
                equipment: "barbell"
            },
            {
                name: "Close-grip Bench Press",
                category: "arms",
                description: "Close grip for triceps emphasis",
                muscleGroups: ["triceps", "chest"],
                equipment: "barbell"
            },
            {
                name: "Cable Curls",
                category: "arms",
                description: "Cable bicep curl",
                muscleGroups: ["biceps"],
                equipment: "cable"
            },
            {
                name: "Reverse Curls",
                category: "arms",
                description: "Reverse grip curl for forearms",
                muscleGroups: ["forearms", "biceps"],
                equipment: "barbell"
            },

            // Core Exercises
            {
                name: "Plank",
                category: "core",
                description: "Static core hold",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Crunches",
                category: "core",
                description: "Basic abdominal crunch",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Russian Twists",
                category: "core",
                description: "Rotational core exercise",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Hanging Knee Raises",
                category: "core",
                description: "Lower ab exercise",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Mountain Climbers",
                category: "core",
                description: "Dynamic core cardio exercise",
                muscleGroups: ["core", "cardio"],
                equipment: "bodyweight"
            },
            {
                name: "Leg Raises",
                category: "core",
                description: "Lying leg raise",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Bicycle Crunches",
                category: "core",
                description: "Cross-body crunch movement",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Dead Bug",
                category: "core",
                description: "Core stabilization exercise",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },

            // Cardio Exercises
            {
                name: "Running",
                category: "cardio",
                description: "Basic running exercise",
                muscleGroups: ["cardio", "legs"],
                equipment: "bodyweight"
            },
            {
                name: "Treadmill Running",
                category: "cardio",
                description: "Treadmill running",
                muscleGroups: ["cardio", "legs"],
                equipment: "treadmill"
            },
            {
                name: "Cycling",
                category: "cardio",
                description: "Stationary bike cycling",
                muscleGroups: ["cardio", "legs"],
                equipment: "bike"
            },
            {
                name: "Rowing",
                category: "cardio",
                description: "Rowing machine exercise",
                muscleGroups: ["cardio", "back", "legs"],
                equipment: "rower"
            },
            {
                name: "Jump Rope",
                category: "cardio",
                description: "Jump rope cardio",
                muscleGroups: ["cardio", "calves"],
                equipment: "rope"
            },
            {
                name: "Burpees",
                category: "cardio",
                description: "Full-body cardio movement",
                muscleGroups: ["cardio", "full body"],
                equipment: "bodyweight"
            },
            {
                name: "High Knees",
                category: "cardio",
                description: "High knee cardio drill",
                muscleGroups: ["cardio", "legs"],
                equipment: "bodyweight"
            },
            {
                name: "Box Jumps",
                category: "cardio",
                description: "Plyometric box jump",
                muscleGroups: ["cardio", "legs"],
                equipment: "box"
            },

            // Bodyweight Exercises
            {
                name: "Pull-ups",
                category: "bodyweight",
                description: "Bodyweight pull-up exercise",
                muscleGroups: ["back", "biceps"],
                equipment: "bodyweight"
            },
            {
                name: "Push-ups",
                category: "bodyweight",
                description: "Classic bodyweight push-up",
                muscleGroups: ["chest", "triceps", "shoulders"],
                equipment: "bodyweight"
            },
            {
                name: "Burpees",
                category: "bodyweight",
                description: "Full-body bodyweight exercise",
                muscleGroups: ["full body"],
                equipment: "bodyweight"
            },
            {
                name: "Squats",
                category: "bodyweight",
                description: "Bodyweight squat exercise",
                muscleGroups: ["quads", "glutes"],
                equipment: "bodyweight"
            },
            {
                name: "Lunges",
                category: "bodyweight",
                description: "Bodyweight lunge exercise",
                muscleGroups: ["quads", "glutes", "hamstrings"],
                equipment: "bodyweight"
            },
            {
                name: "Mountain Climbers",
                category: "bodyweight",
                description: "Dynamic bodyweight exercise",
                muscleGroups: ["core", "cardio"],
                equipment: "bodyweight"
            },
            {
                name: "Plank",
                category: "bodyweight",
                description: "Static bodyweight core hold",
                muscleGroups: ["core"],
                equipment: "bodyweight"
            },
            {
                name: "Dips",
                category: "bodyweight",
                description: "Bodyweight dip exercise",
                muscleGroups: ["chest", "triceps"],
                equipment: "bodyweight"
            },
            {
                name: "Wall Sit",
                category: "bodyweight",
                description: "Isometric squat hold",
                muscleGroups: ["quads"],
                equipment: "bodyweight"
            },
            {
                name: "Superman",
                category: "bodyweight",
                description: "Back extension exercise",
                muscleGroups: ["back", "glutes"],
                equipment: "bodyweight"
            }
        ];
    }

    // Initialize default exercises in database
    async initializeDefaultExercises() {
        try {
            const existingExercises = await gymDB.getDefaultExercises();
            
            // If no default exercises exist, add them
            if (existingExercises.length === 0) {
                console.log('Adding default exercises to database...');
                
                for (const exercise of this.defaultExercises) {
                    await gymDB.add('exercises', {
                        ...exercise,
                        isCustom: false,
                        createdAt: new Date().toISOString()
                    });
                }
                
                console.log(`Added ${this.defaultExercises.length} default exercises`);
            } else {
                console.log(`Found ${existingExercises.length} existing default exercises`);
            }
        } catch (error) {
            console.error('Failed to initialize default exercises:', error);
        }
    }

    // Get exercises by category
    async getExercisesByCategory(category = 'all') {
        try {
            if (category === 'all') {
                return await gymDB.getAllExercises();
            } else if (category === 'custom') {
                return await gymDB.getCustomExercises();
            } else {
                return await gymDB.getExercisesByCategory(category);
            }
        } catch (error) {
            console.error('Failed to get exercises by category:', error);
            return [];
        }
    }

    // Add custom exercise
    async addCustomExercise(name, category, description = '') {
        try {
            const exercise = {
                name,
                category,
                description,
                muscleGroups: [],
                equipment: 'bodyweight',
                isCustom: true,
                createdAt: new Date().toISOString()
            };
            
            return await gymDB.addExercise(exercise);
        } catch (error) {
            console.error('Failed to add custom exercise:', error);
            throw error;
        }
    }

    // Search exercises
    async searchExercises(query, category = 'all') {
        try {
            const exercises = await this.getExercisesByCategory(category);
            const lowercaseQuery = query.toLowerCase();
            
            return exercises.filter(exercise => 
                exercise.name.toLowerCase().includes(lowercaseQuery) ||
                exercise.description.toLowerCase().includes(lowercaseQuery) ||
                exercise.muscleGroups.some(muscle => muscle.toLowerCase().includes(lowercaseQuery))
            );
        } catch (error) {
            console.error('Failed to search exercises:', error);
            return [];
        }
    }

    // Get exercise by ID
    async getExerciseById(id) {
        try {
            return await gymDB.getById('exercises', id);
        } catch (error) {
            console.error('Failed to get exercise by ID:', error);
            return null;
        }
    }

    // Update custom exercise
    async updateCustomExercise(exercise) {
        try {
            if (!exercise.isCustom) {
                throw new Error('Only custom exercises can be updated');
            }
            return await gymDB.updateExercise(exercise);
        } catch (error) {
            console.error('Failed to update exercise:', error);
            throw error;
        }
    }

    // Delete custom exercise
    async deleteCustomExercise(id) {
        try {
            return await gymDB.deleteExercise(id);
        } catch (error) {
            console.error('Failed to delete exercise:', error);
            throw error;
        }
    }

    // Get exercise categories
    getCategories() {
        return [
            { value: 'all', label: 'All Exercises' },
            { value: 'chest', label: 'Chest' },
            { value: 'back', label: 'Back' },
            { value: 'shoulders', label: 'Shoulders' },
            { value: 'legs', label: 'Legs' },
            { value: 'arms', label: 'Arms' },
            { value: 'core', label: 'Core' },
            { value: 'cardio', label: 'Cardio' },
            { value: 'bodyweight', label: 'Bodyweight' },
            { value: 'custom', label: 'Custom Exercises' }
        ];
    }

    // Get popular exercises (most logged)
    async getPopularExercises(limit = 10) {
        try {
            const allSets = await gymDB.getAllExerciseSets();
            const exerciseCount = {};
            
            // Count exercise usage
            allSets.forEach(set => {
                exerciseCount[set.exercise] = (exerciseCount[set.exercise] || 0) + 1;
            });
            
            // Sort by usage count
            const sortedExercises = Object.entries(exerciseCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, limit);
            
            const exercises = await gymDB.getAllExercises();
            const exerciseMap = {};
            exercises.forEach(ex => {
                exerciseMap[ex.name] = ex;
            });
            
            return sortedExercises.map(([exerciseName, count]) => ({
                ...exerciseMap[exerciseName],
                logCount: count
            })).filter(ex => ex.name);
        } catch (error) {
            console.error('Failed to get popular exercises:', error);
            return [];
        }
    }

    // Get muscle group breakdown
    async getMuscleGroupStats() {
        try {
            const allSets = await gymDB.getAllExerciseSets();
            const muscleGroupStats = {};
            
            const exercises = await gymDB.getAllExercises();
            const exerciseMap = {};
            exercises.forEach(ex => {
                exerciseMap[ex.name] = ex;
            });
            
            allSets.forEach(set => {
                const exercise = exerciseMap[set.exercise];
                if (exercise && exercise.muscleGroups) {
                    exercise.muscleGroups.forEach(muscle => {
                        if (!muscleGroupStats[muscle]) {
                            muscleGroupStats[muscle] = {
                                sets: 0,
                                volume: 0,
                                exercises: new Set()
                            };
                        }
                        
                        muscleGroupStats[muscle].sets += 1;
                        muscleGroupStats[muscle].volume += set.weight * set.reps * set.sets;
                        muscleGroupStats[muscle].exercises.add(set.exercise);
                    });
                }
            });
            
            // Convert sets to arrays for JSON serialization
            Object.keys(muscleGroupStats).forEach(muscle => {
                muscleGroupStats[muscle].exercises = Array.from(muscleGroupStats[muscle].exercises);
            });
            
            return muscleGroupStats;
        } catch (error) {
            console.error('Failed to get muscle group stats:', error);
            return {};
        }
    }
}

// Create global exercise library instance
window.exerciseLibrary = new ExerciseLibrary();

// Initialize default exercises when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await exerciseLibrary.initializeDefaultExercises();
        console.log('Exercise library initialized successfully');
    } catch (error) {
        console.error('Failed to initialize exercise library:', error);
    }
});