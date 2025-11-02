// Main Application JavaScript for Gym Tracker PWA
class GymTrackerApp {
    constructor() {
        this.currentWorkout = null;
        this.currentPage = 'workout';
        this.timerInterval = null;
        this.timerSeconds = 0;
        this.charts = {};
        
        // PWA installation
        this.deferredPrompt = null;
        this.isInstalled = false;
        
        // Initialize app
        this.init();
    }

    async init() {
        try {
            // Initialize database and exercises
            await gymDB.init();
            await exerciseLibrary.initializeDefaultExercises();
            
            // Setup PWA
            this.setupPWA();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup navigation
            this.setupNavigation();
            
            // Initialize timer
            this.initTimer();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup service worker
            this.setupServiceWorker();
            
            console.log('Gym Tracker App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    setupPWA() {
        // Handle PWA installation prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.style.display = 'block';
                installBtn.addEventListener('click', () => {
                    this.installPWA();
                });
            }
        });

        // Handle PWA installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isInstalled = true;
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        });
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            return;
        }

        const result = await this.deferredPrompt.prompt();
        console.log('PWA install prompt result:', result);
        
        this.deferredPrompt = null;
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Workout controls
        document.getElementById('start-workout-btn')?.addEventListener('click', () => this.startWorkout());
        document.getElementById('end-workout-btn')?.addEventListener('click', () => this.endWorkout());
        document.getElementById('add-exercise-btn')?.addEventListener('click', () => this.addExerciseToWorkout());
        document.getElementById('add-set-btn')?.addEventListener('click', () => this.addSetToExercise());

        // Rest timer controls
        document.getElementById('rest-60')?.addEventListener('click', () => this.setRestTimer(60));
        document.getElementById('rest-90')?.addEventListener('click', () => this.setRestTimer(90));
        document.getElementById('rest-120')?.addEventListener('click', () => this.setRestTimer(120));
        document.getElementById('rest-custom')?.addEventListener('click', () => this.setCustomRestTimer());
        document.getElementById('start-timer')?.addEventListener('click', () => this.startTimer());
        document.getElementById('stop-timer')?.addEventListener('click', () => this.stopTimer());
        document.getElementById('reset-timer')?.addEventListener('click', () => this.resetTimer());

        // History filter
        document.getElementById('history-filter')?.addEventListener('change', () => this.loadWorkoutHistory());

        // Progress filters
        document.getElementById('progress-exercise-filter')?.addEventListener('change', () => this.updateProgressCharts());
        document.getElementById('progress-time-filter')?.addEventListener('change', () => this.updateProgressCharts());

        // Exercise library
        document.getElementById('add-custom-exercise-btn')?.addEventListener('click', () => this.showCustomExerciseModal());
        document.getElementById('exercise-search')?.addEventListener('input', (e) => this.searchExercises(e.target.value));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.filterExercises(e.currentTarget.dataset.category);
            });
        });

        // Settings
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data-btn')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-data-btn')?.addEventListener('click', () => this.showClearDataConfirm());
        document.getElementById('default-rest-time')?.addEventListener('change', (e) => this.saveSetting('defaultRestTime', e.target.value));
        document.getElementById('weight-unit')?.addEventListener('change', (e) => this.saveSetting('weightUnit', e.target.value));

        // Modals
        document.getElementById('save-custom-exercise')?.addEventListener('click', () => this.saveCustomExercise());
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) closeModal(modal.id);
            });
        });

        // File input for import
        document.getElementById('import-file-input')?.addEventListener('change', (e) => this.handleFileImport(e));

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModal(e.target.id);
            }
        });
    }

    setupNavigation() {
        // Handle URL parameters for deep linking
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'start-workout') {
            this.navigateToPage('workout');
            setTimeout(() => this.startWorkout(), 100);
        } else if (action === 'view-history') {
            this.navigateToPage('history');
        } else if (action === 'view-progress') {
            this.navigateToPage('progress');
        } else {
            // Default to workout page
            this.navigateToPage('workout');
        }
    }

    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

        // Update page visibility
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`)?.classList.add('active');

        this.currentPage = page;

        // Load page-specific data
        this.loadPageData(page);
    }

    async loadPageData(page) {
        switch (page) {
            case 'workout':
                this.loadWorkoutPage();
                break;
            case 'history':
                await this.loadWorkoutHistory();
                break;
            case 'progress':
                await this.loadProgressPage();
                break;
            case 'exercises':
                await this.loadExerciseLibrary();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadInitialData() {
        await this.loadWorkoutPage();
    }

    async loadWorkoutPage() {
        const currentWorkoutId = localStorage.getItem('currentWorkoutId');
        
        if (currentWorkoutId) {
            try {
                this.currentWorkout = await gymDB.getById('workouts', parseInt(currentWorkoutId));
                if (this.currentWorkout) {
                    this.showCurrentWorkout();
                } else {
                    // Clean up invalid workout ID
                    localStorage.removeItem('currentWorkoutId');
                    this.showNoWorkout();
                }
            } catch (error) {
                console.error('Failed to load current workout:', error);
                localStorage.removeItem('currentWorkoutId');
                this.showNoWorkout();
            }
        } else {
            this.showNoWorkout();
        }

        // Load exercise list
        await this.loadExerciseOptions();
    }

    showCurrentWorkout() {
        document.getElementById('current-workout').style.display = 'block';
        document.getElementById('no-workout').style.display = 'none';
        this.updateWorkoutTimer();
    }

    showNoWorkout() {
        document.getElementById('current-workout').style.display = 'none';
        document.getElementById('no-workout').style.display = 'block';
    }

    async startWorkout() {
        try {
            const workout = {
                name: `Workout ${new Date().toLocaleDateString()}`,
                duration: 0,
                startedAt: new Date().toISOString(),
                exercises: []
            };

            const workoutId = await gymDB.addWorkout(workout);
            this.currentWorkout = { ...workout, id: workoutId };
            localStorage.setItem('currentWorkoutId', workoutId.toString());

            this.showCurrentWorkout();
            this.startWorkoutTimer();
        } catch (error) {
            console.error('Failed to start workout:', error);
            this.showError('Failed to start workout');
        }
    }

    async endWorkout() {
        if (!this.currentWorkout) return;

        try {
            this.currentWorkout.duration = this.getWorkoutDuration();
            await gymDB.updateWorkout(this.currentWorkout);
            
            localStorage.removeItem('currentWorkoutId');
            this.currentWorkout = null;
            
            this.showNoWorkout();
            this.stopWorkoutTimer();
            
            this.showSuccess('Workout saved successfully!');
        } catch (error) {
            console.error('Failed to end workout:', error);
            this.showError('Failed to save workout');
        }
    }

    startWorkoutTimer() {
        this.workoutTimerStart = Date.now();
        this.workoutTimerInterval = setInterval(() => {
            this.updateWorkoutTimer();
        }, 1000);
    }

    stopWorkoutTimer() {
        if (this.workoutTimerInterval) {
            clearInterval(this.workoutTimerInterval);
            this.workoutTimerInterval = null;
        }
    }

    getWorkoutDuration() {
        if (!this.workoutTimerStart) return 0;
        return Math.floor((Date.now() - this.workoutTimerStart) / 1000);
    }

    updateWorkoutTimer() {
        if (!this.workoutTimerStart) return;

        const duration = this.getWorkoutDuration();
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        const timerElement = document.getElementById('workout-timer');
        if (timerElement) {
            timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    async loadExerciseOptions() {
        const select = document.getElementById('exercise-select');
        if (!select) return;

        try {
            const exercises = await gymDB.getAllExercises();
            select.innerHTML = '<option value="">Select an exercise...</option>';
            
            exercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.name;
                option.textContent = exercise.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load exercises:', error);
        }
    }

    async addExerciseToWorkout() {
        const exerciseName = document.getElementById('exercise-select').value;
        const weight = parseFloat(document.getElementById('weight-input').value);
        const reps = parseInt(document.getElementById('reps-input').value);
        const sets = parseInt(document.getElementById('sets-input').value);
        const notes = document.getElementById('notes-input').value;

        if (!exerciseName || isNaN(weight) || isNaN(reps) || isNaN(sets)) {
            this.showError('Please fill in all required fields');
            return;
        }

        try {
            const exerciseSet = {
                workoutId: this.currentWorkout.id,
                exercise: exerciseName,
                weight: weight,
                reps: reps,
                sets: sets,
                notes: notes,
                date: new Date().toISOString()
            };

            await gymDB.addExerciseSet(exerciseSet);
            await this.loadCurrentExercises();
            
            // Clear form
            document.getElementById('exercise-select').value = '';
            document.getElementById('weight-input').value = '';
            document.getElementById('reps-input').value = '';
            document.getElementById('sets-input').value = '3';
            document.getElementById('notes-input').value = '';

            this.showSuccess('Exercise added successfully!');
        } catch (error) {
            console.error('Failed to add exercise:', error);
            this.showError('Failed to add exercise');
        }
    }

    async loadCurrentExercises() {
        if (!this.currentWorkout) return;

        try {
            const exerciseSets = await gymDB.getExerciseSetsByWorkout(this.currentWorkout.id);
            const container = document.getElementById('current-exercises');
            
            container.innerHTML = '';
            
            if (exerciseSets.length === 0) {
                container.innerHTML = '<p class="empty-message">No exercises added yet</p>';
                return;
            }

            exerciseSets.forEach(set => {
                const exerciseElement = document.createElement('div');
                exerciseElement.className = 'exercise-item';
                exerciseElement.innerHTML = `
                    <div class="exercise-header">
                        <div class="exercise-name">${set.exercise}</div>
                        <button class="exercise-remove" onclick="app.removeExercise(${set.id})">×</button>
                    </div>
                    <div class="exercise-details">
                        <div class="exercise-detail">
                            <span class="exercise-detail-value">${set.weight}</span>
                            <span class="exercise-detail-label">kg</span>
                        </div>
                        <div class="exercise-detail">
                            <span class="exercise-detail-value">${set.reps}</span>
                            <span class="exercise-detail-label">reps</span>
                        </div>
                        <div class="exercise-detail">
                            <span class="exercise-detail-value">${set.sets}</span>
                            <span class="exercise-detail-label">sets</span>
                        </div>
                    </div>
                    ${set.notes ? `<div class="exercise-notes">${set.notes}</div>` : ''}
                `;
                container.appendChild(exerciseElement);
            });
        } catch (error) {
            console.error('Failed to load current exercises:', error);
        }
    }

    async removeExercise(setId) {
        try {
            await gymDB.deleteExerciseSet(setId);
            await this.loadCurrentExercises();
            this.showSuccess('Exercise removed');
        } catch (error) {
            console.error('Failed to remove exercise:', error);
            this.showError('Failed to remove exercise');
        }
    }

    // Rest Timer Functions
    initTimer() {
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.updateTimerDisplay();
    }

    setRestTimer(seconds) {
        this.timerSeconds = seconds;
        this.updateTimerDisplay();
        
        // Update button states
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event?.target?.classList.add('active');
    }

    setCustomRestTimer() {
        const minutes = prompt('Enter rest time in minutes:', '2');
        if (minutes && !isNaN(minutes)) {
            this.setRestTimer(parseInt(minutes) * 60);
        }
    }

    startTimer() {
        if (this.timerInterval) return;
        
        this.timerStart = Date.now();
        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            this.updateTimerDisplay();
            
            if (this.timerSeconds <= 0) {
                this.stopTimer();
                this.playNotificationSound();
                this.showNotification('Rest time is over!');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.timerSeconds = 120; // Default to 2 minutes
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const display = document.getElementById('timer-display');
        if (display) {
            const minutes = Math.floor(this.timerSeconds / 60);
            const seconds = this.timerSeconds % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    playNotificationSound() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }

    // History Functions
    async loadWorkoutHistory() {
        try {
            const filter = document.getElementById('history-filter').value;
            const endDate = new Date();
            let startDate = new Date();
            
            switch (filter) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
                default:
                    startDate = new Date(0); // All time
            }
            
            const workouts = await gymDB.getWorkoutsByDateRange(startDate, endDate);
            const container = document.getElementById('history-list');
            
            container.innerHTML = '';
            
            if (workouts.length === 0) {
                document.getElementById('no-history').style.display = 'block';
                return;
            } else {
                document.getElementById('no-history').style.display = 'none';
            }
            
            for (const workout of workouts) {
                const exerciseSets = await gymDB.getExerciseSetsByWorkout(workout.id);
                const workoutElement = document.createElement('div');
                workoutElement.className = 'history-item';
                
                const date = new Date(workout.date).toLocaleDateString();
                const duration = Math.floor(workout.duration / 60);
                
                workoutElement.innerHTML = `
                    <div class="history-header">
                        <div class="history-date">${date}</div>
                        <div class="history-duration">${duration} min</div>
                    </div>
                    <div class="history-summary">
                        ${exerciseSets.length} exercises • ${this.calculateTotalVolume(exerciseSets)} kg total volume
                    </div>
                `;
                
                workoutElement.addEventListener('click', () => this.showWorkoutDetails(workout.id));
                container.appendChild(workoutElement);
            }
        } catch (error) {
            console.error('Failed to load workout history:', error);
        }
    }

    calculateTotalVolume(sets) {
        return sets.reduce((total, set) => total + (set.weight * set.reps * set.sets), 0);
    }

    async showWorkoutDetails(workoutId) {
        try {
            const workout = await gymDB.getById('workouts', workoutId);
            const exerciseSets = await gymDB.getExerciseSetsByWorkout(workoutId);
            
            const container = document.getElementById('workout-details-content');
            const date = new Date(workout.date).toLocaleDateString();
            const duration = Math.floor(workout.duration / 60);
            
            container.innerHTML = `
                <div class="workout-details-header">
                    <h4>${workout.name}</h4>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Duration:</strong> ${duration} minutes</p>
                    <p><strong>Total Volume:</strong> ${this.calculateTotalVolume(exerciseSets)} kg</p>
                </div>
                <div class="workout-exercises">
                    <h5>Exercises:</h5>
                    ${exerciseSets.map(set => `
                        <div class="workout-exercise">
                            <strong>${set.exercise}</strong>
                            <br>
                            ${set.weight}kg × ${set.reps} reps × ${set.sets} sets
                            ${set.notes ? `<br><em>Notes: ${set.notes}</em>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Setup delete button
            const deleteBtn = document.getElementById('delete-workout-btn');
            deleteBtn.onclick = () => this.deleteWorkout(workoutId);
            
            showModal('workout-details-modal');
        } catch (error) {
            console.error('Failed to show workout details:', error);
        }
    }

    async deleteWorkout(workoutId) {
        if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
            return;
        }
        
        try {
            await gymDB.deleteWorkout(workoutId);
            closeModal('workout-details-modal');
            await this.loadWorkoutHistory();
            this.showSuccess('Workout deleted successfully');
        } catch (error) {
            console.error('Failed to delete workout:', error);
            this.showError('Failed to delete workout');
        }
    }

    // Progress Functions
    async loadProgressPage() {
        await this.updateProgressStats();
        await this.updateProgressCharts();
    }

    async updateProgressStats() {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            
            const stats = await gymDB.getWorkoutStats(startDate, endDate);
            
            document.getElementById('total-workouts').textContent = stats.totalWorkouts;
            document.getElementById('total-volume').textContent = `${Math.round(stats.totalVolume)} kg`;
            document.getElementById('avg-workout').textContent = `${stats.avgDuration} min`;
            
            // Update exercise filter
            const exerciseFilter = document.getElementById('progress-exercise-filter');
            exerciseFilter.innerHTML = '<option value="all">All Exercises</option>';
            
            const exercises = await gymDB.getAllExercises();
            exercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.name;
                option.textContent = exercise.name;
                exerciseFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to update progress stats:', error);
        }
    }

    async updateProgressCharts() {
        try {
            const timeFilter = document.getElementById('progress-time-filter').value;
            const exerciseFilter = document.getElementById('progress-exercise-filter').value;
            
            const endDate = new Date();
            let startDate = new Date();
            
            switch (timeFilter) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }
            
            const workouts = await gymDB.getWorkoutsByDateRange(startDate, endDate);
            const allSets = await gymDB.getAllExerciseSets();
            
            // Filter sets by workout date range
            const filteredSets = allSets.filter(set => {
                const setDate = new Date(set.date);
                return setDate >= startDate && setDate <= endDate;
            });
            
            // Filter by exercise if selected
            const relevantSets = exerciseFilter === 'all' 
                ? filteredSets 
                : filteredSets.filter(set => set.exercise === exerciseFilter);
            
            this.updateWeightChart(relevantSets);
            this.updateVolumeChart(workouts);
            this.updateFrequencyChart(workouts);
            
        } catch (error) {
            console.error('Failed to update progress charts:', error);
        }
    }

    updateWeightChart(sets) {
        const ctx = document.getElementById('weight-chart').getContext('2d');
        
        // Group sets by exercise and date
        const dataByDate = {};
        sets.forEach(set => {
            const date = new Date(set.date).toDateString();
            if (!dataByDate[date]) {
                dataByDate[date] = {};
            }
            if (!dataByDate[date][set.exercise]) {
                dataByDate[date][set.exercise] = [];
            }
            dataByDate[date][set.exercise].push(set.weight);
        });
        
        // Calculate average weight per exercise per date
        const datasets = [];
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        let colorIndex = 0;
        
        Object.keys(dataByDate).forEach(date => {
            const dateData = dataByDate[date];
            Object.keys(dateData).forEach(exercise => {
                const weights = dateData[exercise];
                const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
                
                datasets.push({
                    label: exercise,
                    data: [{ x: date, y: avgWeight }],
                    borderColor: colors[colorIndex % colors.length],
                    backgroundColor: colors[colorIndex % colors.length] + '20',
                    tension: 0.4
                });
                colorIndex++;
            });
        });
        
        if (this.charts.weight) {
            this.charts.weight.destroy();
        }
        
        this.charts.weight = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
    }

    updateVolumeChart(workouts) {
        const ctx = document.getElementById('volume-chart').getContext('2d');
        
        const data = workouts.map(workout => ({
            x: workout.date,
            y: workout.duration / 60 // Convert to minutes
        }));
        
        if (this.charts.volume) {
            this.charts.volume.destroy();
        }
        
        this.charts.volume = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'Workout Duration (minutes)',
                    data,
                    backgroundColor: '#2563eb80',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        }
                    }
                }
            }
        });
    }

    updateFrequencyChart(workouts) {
        const ctx = document.getElementById('frequency-chart').getContext('2d');
        
        // Group workouts by week
        const weeklyData = {};
        workouts.forEach(workout => {
            const date = new Date(workout.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toDateString();
            
            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
        });
        
        const data = Object.entries(weeklyData).map(([week, count]) => ({
            x: week,
            y: count
        }));
        
        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }
        
        this.charts.frequency = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Workouts per Week',
                    data,
                    borderColor: '#10b981',
                    backgroundColor: '#10b98120',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'week' }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Workouts'
                        }
                    }
                }
            }
        });
    }

    // Exercise Library Functions
    async loadExerciseLibrary() {
        await this.filterExercises('all');
    }

    async filterExercises(category) {
        try {
            const exercises = await exerciseLibrary.getExercisesByCategory(category);
            this.renderExerciseLibrary(exercises);
        } catch (error) {
            console.error('Failed to filter exercises:', error);
        }
    }

    renderExerciseLibrary(exercises) {
        const container = document.getElementById('exercise-library');
        container.innerHTML = '';
        
        exercises.forEach(exercise => {
            const exerciseElement = document.createElement('div');
            exerciseElement.className = 'exercise-card';
            exerciseElement.innerHTML = `
                <h4>${exercise.name}</h4>
                <p><strong>Category:</strong> ${exercise.category}</p>
                ${exercise.description ? `<p>${exercise.description}</p>` : ''}
                <p><strong>Equipment:</strong> ${exercise.equipment}</p>
                ${exercise.isCustom ? '<button class="secondary-btn" onclick="app.editCustomExercise(' + exercise.id + ')">Edit</button>' : ''}
            `;
            container.appendChild(exerciseElement);
        });
    }

    async searchExercises(query) {
        if (!query.trim()) {
            await this.filterExercises(document.querySelector('.filter-btn.active')?.dataset.category || 'all');
            return;
        }
        
        try {
            const exercises = await exerciseLibrary.searchExercises(query);
            this.renderExerciseLibrary(exercises);
        } catch (error) {
            console.error('Failed to search exercises:', error);
        }
    }

    showCustomExerciseModal() {
        showModal('custom-exercise-modal');
    }

    async saveCustomExercise() {
        const name = document.getElementById('custom-exercise-name').value;
        const category = document.getElementById('custom-exercise-category').value;
        const description = document.getElementById('custom-exercise-description').value;
        
        if (!name.trim() || !category) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        try {
            await exerciseLibrary.addCustomExercise(name.trim(), category, description.trim());
            closeModal('custom-exercise-modal');
            
            // Clear form
            document.getElementById('custom-exercise-name').value = '';
            document.getElementById('custom-exercise-category').value = 'chest';
            document.getElementById('custom-exercise-description').value = '';
            
            await this.loadExerciseLibrary();
            await this.loadExerciseOptions();
            
            this.showSuccess('Custom exercise added successfully!');
        } catch (error) {
            console.error('Failed to save custom exercise:', error);
            this.showError('Failed to save exercise');
        }
    }

    // Settings Functions
    loadSettings() {
        this.loadSetting('defaultRestTime', 'default-rest-time', '120');
        this.loadSetting('weightUnit', 'weight-unit', 'kg');
    }

    async loadSetting(key, elementId, defaultValue) {
        try {
            const value = await gymDB.getSetting(key);
            if (value) {
                document.getElementById(elementId).value = value;
            } else {
                document.getElementById(elementId).value = defaultValue;
            }
        } catch (error) {
            console.error(`Failed to load setting ${key}:`, error);
        }
    }

    async saveSetting(key, value) {
        try {
            await gymDB.setSetting(key, value);
        } catch (error) {
            console.error(`Failed to save setting ${key}:`, error);
        }
    }

    // Data Management Functions
    async exportData() {
        try {
            const data = await gymDB.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `gym-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Data exported successfully!');
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showError('Failed to export data');
        }
    }

    importData() {
        document.getElementById('import-file-input').click();
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!confirm('Are you sure you want to import this data? This will merge with your existing data.')) {
                return;
            }
            
            await gymDB.importData(data);
            await this.loadInitialData();
            
            this.showSuccess('Data imported successfully!');
        } catch (error) {
            console.error('Failed to import data:', error);
            this.showError('Failed to import data. Please check the file format.');
        }
        
        // Clear file input
        event.target.value = '';
    }

    showClearDataConfirm() {
        showConfirmDialog(
            'Clear All Data',
            'Are you sure you want to clear all workout data? This action cannot be undone.',
            async () => {
                try {
                    await gymDB.clearAllData();
                    await this.loadInitialData();
                    this.showSuccess('All data cleared successfully!');
                } catch (error) {
                    console.error('Failed to clear data:', error);
                    this.showError('Failed to clear data');
                }
            }
        );
    }

    // Utility Functions
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            font-weight: 600;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation styles
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const yesBtn = document.getElementById('confirm-yes-btn');
    yesBtn.onclick = () => {
        closeModal('confirm-dialog');
        onConfirm();
    };
    
    showModal('confirm-dialog');
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GymTrackerApp();
});