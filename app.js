// ===== BUG BOUNTY TRACKER APPLICATION =====

// ===== DATA MANAGEMENT =====
const Storage = {
    keys: {
        bugs: 'bugBountyTracker_bugs',
        settings: 'bugBountyTracker_settings',
        sessions: 'bugBountyTracker_sessions',
        timerState: 'bugBountyTracker_timerState'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },

    getBugs() {
        return this.get(this.keys.bugs) || [];
    },

    saveBugs(bugs) {
        return this.set(this.keys.bugs, bugs);
    },

    getSettings() {
        const defaultSettings = {
            goal: 1000000,
            startDate: new Date().toISOString().split('T')[0]
        };
        return this.get(this.keys.settings) || defaultSettings;
    },

    saveSettings(settings) {
        return this.set(this.keys.settings, settings);
    },

    getSessions() {
        return this.get(this.keys.sessions) || [];
    },

    saveSessions(sessions) {
        return this.set(this.keys.sessions, sessions);
    },

    getTimerState() {
        return this.get(this.keys.timerState);
    },

    saveTimerState(state) {
        return this.set(this.keys.timerState, state);
    },

    clearTimerState() {
        localStorage.removeItem(this.keys.timerState);
    }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    formatCurrency(amount) {
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + (amount / 1000).toFixed(1) + 'k';
        }
        return '$' + amount.toFixed(0);
    },

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    formatDurationShort(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getDayOfYear(date = new Date()) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    },

    getToday() {
        return new Date().toISOString().split('T')[0];
    },

    getWeekDays() {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    },

    getMonthDays() {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ===== DASHBOARD MANAGER =====
const Dashboard = {
    init() {
        this.updateProgress();
        this.updateEarnings();
        this.updateQuickStats();
        this.initSettings();
        this.renderProgressBars();
    },

    updateProgress() {
        const settings = Storage.getSettings();
        const startDate = new Date(settings.startDate);
        const today = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysPassed);
        const progressPercent = Math.min(100, (daysPassed / totalDays) * 100);

        document.getElementById('progressPercentage').textContent = progressPercent.toFixed(1) + '%';
        document.getElementById('currentDay').textContent = Math.max(1, daysPassed);
        document.getElementById('daysRemaining').textContent = daysRemaining;
    },

    updateEarnings() {
        const bugs = Storage.getBugs();
        const settings = Storage.getSettings();
        const goal = settings.goal;

        const currentEarnings = bugs.reduce((sum, bug) => sum + (parseFloat(bug.amount) || 0), 0);
        const remaining = Math.max(0, goal - currentEarnings);
        const percent = Math.min(100, (currentEarnings / goal) * 100);

        document.getElementById('earningsPercent').textContent = percent.toFixed(1) + '%';
        document.getElementById('earningsBar').style.width = percent + '%';
        document.getElementById('earningsRemaining').textContent = '$' + remaining.toLocaleString() + ' left';
        document.getElementById('currentEarnings').textContent = Utils.formatCurrency(currentEarnings);
        document.getElementById('remainingAmount').textContent = Utils.formatCurrency(remaining);
        document.getElementById('goalAmount').textContent = Utils.formatCurrency(goal);
    },

    updateQuickStats() {
        const bugs = Storage.getBugs();
        const sessions = Storage.getSessions();
        const today = Utils.getToday();
        const weekDays = Utils.getWeekDays();

        // Bug stats
        const totalBugs = bugs.length;
        const criticalBugs = bugs.filter(b => b.severity === 'critical').length;

        // Time stats
        const todaySessions = sessions.filter(s => s.date === today);
        const todaySeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);

        const weekSessions = sessions.filter(s => weekDays.includes(s.date));
        const weekSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0);

        document.getElementById('totalBugs').textContent = totalBugs;
        document.getElementById('criticalBugs').textContent = criticalBugs;
        document.getElementById('todayHours').textContent = Utils.formatDurationShort(todaySeconds);
        document.getElementById('weekHours').textContent = Utils.formatDurationShort(weekSeconds);
    },

    initSettings() {
        const settings = Storage.getSettings();
        document.getElementById('goalInput').value = settings.goal;
        document.getElementById('startDateInput').value = settings.startDate;

        document.getElementById('saveSettings').addEventListener('click', () => {
            const newSettings = {
                goal: parseInt(document.getElementById('goalInput').value) || 1000000,
                startDate: document.getElementById('startDateInput').value || Utils.getToday()
            };
            Storage.saveSettings(newSettings);
            this.updateProgress();
            this.updateEarnings();
        });
    },

    renderProgressBars() {
        const container = document.getElementById('progressBars');
        container.innerHTML = '';

        const settings = Storage.getSettings();
        const startDate = new Date(settings.startDate);
        const today = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        const progressPercent = (daysPassed / totalDays) * 100;

        // Create 12 bars representing months
        for (let i = 0; i < 12; i++) {
            const bar = document.createElement('div');
            bar.className = 'progress-bar-item';

            const monthProgress = (i + 1) * (100 / 12);
            let height;

            if (progressPercent >= monthProgress) {
                height = 60 + Math.random() * 20;
            } else if (progressPercent > monthProgress - (100 / 12)) {
                height = 20 + ((progressPercent - (monthProgress - (100 / 12))) / (100 / 12)) * 60;
            } else {
                height = 10 + Math.random() * 10;
            }

            bar.style.setProperty('--bar-height', height + 'px');
            bar.style.animationDelay = (i * 0.05) + 's';
            container.appendChild(bar);
        }
    }
};

// ===== BUG MANAGER =====
const BugManager = {
    currentBugId: null,
    editingBugId: null,

    currentSort: 'newest',
    currentFilterMonth: '',

    init() {
        this.renderBugs();
        this.initModal();
        this.initControls();
    },

    initControls() {
        // Set default month to current month to avoid "------" display
        const today = new Date();
        const monthStr = today.toISOString().slice(0, 7); // YYYY-MM
        const monthInput = document.getElementById('bugMonthFilter');

        // Only set if not already set (e.g. reload)
        if (!monthInput.value) {
            monthInput.value = monthStr;
        }

        document.getElementById('bugSort').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderBugs();
        });

        document.getElementById('bugMonthFilter').addEventListener('change', (e) => {
            this.currentFilterMonth = e.target.value;
            this.renderBugs();
        });

        document.getElementById('exportBugsBtn').addEventListener('click', () => {
            this.exportBugs();
        });
    },

    exportBugs() {
        const bugs = Storage.getBugs();
        if (bugs.length === 0) {
            alert('No bugs to export');
            return;
        }

        const headers = ['ID', 'Title', 'Platform', 'Amount', 'Severity', 'Date Reported', 'Description'];
        const csvContent = [
            headers.join(','),
            ...bugs.map(bug => {
                return [
                    bug.id,
                    `"${bug.title.replace(/"/g, '""')}"`, // Escape quotes
                    `"${bug.platform.replace(/"/g, '""')}"`,
                    bug.amount,
                    bug.severity,
                    bug.dateReported,
                    `"${(bug.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bug_report_export_${Utils.getToday()}.csv`;
        link.click();
    },

    renderBugs() {
        let bugs = Storage.getBugs();
        const grid = document.getElementById('bugsGrid');
        const emptyState = document.getElementById('emptyBugs');

        // Filter by month if set
        if (this.currentFilterMonth) {
            bugs = bugs.filter(bug => bug.dateReported.startsWith(this.currentFilterMonth));
        }

        // Sort
        bugs.sort((a, b) => {
            const dateA = new Date(a.dateReported);
            const dateB = new Date(b.dateReported);

            switch (this.currentSort) {
                case 'oldest':
                    return dateA - dateB;
                case 'highest':
                    return b.amount - a.amount;
                case 'lowest':
                    return a.amount - b.amount;
                case 'newest':
                default:
                    return dateB - dateA;
            }
        });

        if (bugs.length === 0) {
            grid.style.display = 'none';
            emptyState.classList.add('show');
            return;
        }

        grid.style.display = 'grid';
        emptyState.classList.remove('show');

        grid.innerHTML = bugs.map(bug => `
            <div class="card bug-card" data-id="${bug.id}" style="--severity-color: var(--severity-${bug.severity})">
                <div class="bug-card-header">
                    <div>
                        <div class="bug-title">${this.escapeHtml(bug.title)}</div>
                        <div class="bug-platform">${this.escapeHtml(bug.platform)}</div>
                        <div class="bug-date">${Utils.formatDate(bug.dateReported)}</div>
                    </div>
                    <div class="bug-amount">${Utils.formatCurrency(bug.amount)}</div>
                </div>
                <span class="severity-badge severity-${bug.severity}">${bug.severity}</span>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.bug-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showDetail(card.dataset.id);
            });
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    initModal() {
        const modal = document.getElementById('addBugModal');
        const detailModal = document.getElementById('bugDetailModal');
        const form = document.getElementById('addBugForm');

        // Open modal
        document.getElementById('addBugBtn').addEventListener('click', () => {
            modal.classList.add('show');
        });

        // Close modals
        document.getElementById('closeAddModal').addEventListener('click', () => {
            modal.classList.remove('show');
            this.resetForm();
        });

        document.getElementById('cancelAddBug').addEventListener('click', () => {
            modal.classList.remove('show');
            this.resetForm();
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => {
            detailModal.classList.remove('show');
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                this.resetForm();
            }
        });

        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                detailModal.classList.remove('show');
            }
        });

        // Form submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBug();
        });

        // Delete bug
        document.getElementById('deleteBug').addEventListener('click', () => {
            if (this.currentBugId && confirm('Are you sure you want to delete this bug?')) {
                this.deleteBug(this.currentBugId);
            }
        });
    },

    resetForm() {
        const form = document.getElementById('addBugForm');
        form.reset();
        this.editingBugId = null;

        // Reset modal title and button
        document.querySelector('#addBugModal .modal-header h2').textContent = 'Add New Bug';
        document.querySelector('#addBugModal .btn-primary').textContent = 'Add Bug';
    },

    openEditModal(bugId) {
        const bugs = Storage.getBugs();
        const bug = bugs.find(b => b.id === bugId);

        if (!bug) return;

        this.editingBugId = bugId;

        // Populate form
        document.getElementById('bugTitle').value = bug.title;
        document.getElementById('bugPlatform').value = bug.platform;
        document.getElementById('bugAmount').value = bug.amount;
        document.getElementById('bugSeverity').value = bug.severity;
        document.getElementById('bugDescription').value = bug.description || '';
        document.getElementById('bugDate').value = bug.dateReported;

        // Update modal UI
        document.querySelector('#addBugModal .modal-header h2').textContent = 'Edit Bug';
        document.querySelector('#addBugModal .btn-primary').textContent = 'Update Bug';

        // Close detail modal and open add modal
        document.getElementById('bugDetailModal').classList.remove('show');
        document.getElementById('addBugModal').classList.add('show');
    },

    saveBug() {
        const bugData = {
            title: document.getElementById('bugTitle').value,
            platform: document.getElementById('bugPlatform').value,
            amount: parseFloat(document.getElementById('bugAmount').value) || 0,
            severity: document.getElementById('bugSeverity').value,
            description: document.getElementById('bugDescription').value,
            dateReported: document.getElementById('bugDate').value || new Date().toISOString().split('T')[0]
        };

        let bugs = Storage.getBugs();

        if (this.editingBugId) {
            // Update existing
            const index = bugs.findIndex(b => b.id === this.editingBugId);
            if (index !== -1) {
                bugs[index] = { ...bugs[index], ...bugData };
            }
        } else {
            // Add new
            const bug = {
                id: Utils.generateId(),
                ...bugData
            };
            bugs.unshift(bug);
        }

        Storage.saveBugs(bugs);

        document.getElementById('addBugModal').classList.remove('show');
        this.resetForm();

        this.renderBugs();
        Dashboard.updateEarnings();
        Dashboard.updateQuickStats();

        // If we were editing, re-open detail view with updated data if needed, 
        // or just leave it closed. User flow is usually -> List.
        // But if they clicked edit from detail, they might expect to go back? 
        // Standard behavior is often just return to list or show success.
        // Let's just return to list (which renderBugs does).
    },

    showDetail(bugId) {
        const bugs = Storage.getBugs();
        const bug = bugs.find(b => b.id === bugId);

        if (!bug) return;

        this.currentBugId = bugId;

        document.getElementById('detailTitle').textContent = bug.title;
        document.getElementById('detailPlatform').textContent = bug.platform;
        document.getElementById('detailAmount').textContent = Utils.formatCurrency(bug.amount);
        document.getElementById('detailSeverity').innerHTML =
            `<span class="severity-badge severity-${bug.severity}">${bug.severity}</span>`;
        document.getElementById('detailDate').textContent = Utils.formatDate(bug.dateReported);
        document.getElementById('detailDescription').textContent = bug.description || 'No description provided.';

        document.getElementById('bugDetailModal').classList.add('show');
    },

    deleteBug(bugId) {
        let bugs = Storage.getBugs();
        bugs = bugs.filter(b => b.id !== bugId);
        Storage.saveBugs(bugs);

        document.getElementById('bugDetailModal').classList.remove('show');
        this.currentBugId = null;

        this.renderBugs();
        Dashboard.updateEarnings();
        Dashboard.updateQuickStats();
    }
};

// ===== TIME TRACKER =====
const TimeTracker = {
    intervalId: null,
    running: false,
    startTimestamp: null,
    baseElapsedSeconds: 0,
    lastDisplaySeconds: 0,
    selectedDate: null,
    currentFilter: 'all',

    activityLabels: {
        hunting: '🎯 Bug Hunting',
        docs: '📚 Reading Documentation',
        writeups: '📝 Reading Writeups',
        reports: '🔍 Reading Reports',
        learning: '🎓 Learning/Course',
        recon: '🔎 Reconnaissance',
        testing: '🧪 Testing/Exploitation'
    },

    init() {
        this.selectedDate = Utils.getToday();
        this.cacheElements();
        this.bindEvents();
        this.updateDisplay(0);
        this.renderSessionList(this.selectedDate, this.currentFilter);
        this.renderAnalytics('week');
    },

    cacheElements() {
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startTimer');
        this.pauseBtn = document.getElementById('pauseTimer');
        this.stopBtn = document.getElementById('stopTimer');
        this.noteInput = document.getElementById('sessionNote');
        this.activitySelect = document.getElementById('activityType');
        this.sessionFilter = document.getElementById('sessionFilter');
        this.exportBtn = document.getElementById('exportAnalyticsBtn');
    },

    bindEvents() {
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.start());
        if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.pause());
        if (this.stopBtn) this.stopBtn.addEventListener('click', () => this.stop());

        if (this.sessionFilter) {
            this.sessionFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderSessionList(this.selectedDate, this.currentFilter);
            });
        }

        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderAnalytics(tab.dataset.period);
            });
        });

        if (this.exportBtn) this.exportBtn.addEventListener('click', () => this.exportAnalytics());
    },

    getCurrentElapsedSeconds() {
        if (!this.running || !this.startTimestamp) return this.baseElapsedSeconds;
        return this.baseElapsedSeconds + Math.floor((Date.now() - this.startTimestamp) / 1000);
    },

    updateDisplay(seconds) {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = Utils.formatDuration(seconds);
        }
        this.lastDisplaySeconds = seconds;
    },

    start() {
        if (this.running) return;
        this.running = true;
        this.startTimestamp = Date.now();
        this.intervalId = setInterval(() => this.tick(), 1000);

        if (this.startBtn) this.startBtn.disabled = true;
        if (this.pauseBtn) this.pauseBtn.disabled = false;
        if (this.stopBtn) this.stopBtn.disabled = false;
    },

    pause() {
        if (!this.running) return;
        this.running = false;
        this.baseElapsedSeconds = this.getCurrentElapsedSeconds();
        this.startTimestamp = null;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.updateDisplay(this.baseElapsedSeconds);

        if (this.startBtn) this.startBtn.disabled = false;
        if (this.pauseBtn) this.pauseBtn.disabled = true;
    },

    stop() {
        const totalSeconds = this.getCurrentElapsedSeconds();
        if (totalSeconds > 0) {
            this.saveSession(totalSeconds);
        }

        this.running = false;
        this.startTimestamp = null;
        this.baseElapsedSeconds = 0;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.updateDisplay(0);

        if (this.startBtn) this.startBtn.disabled = false;
        if (this.pauseBtn) this.pauseBtn.disabled = true;
        if (this.stopBtn) this.stopBtn.disabled = true;
        if (this.noteInput) this.noteInput.value = '';

        this.renderSessionList(this.selectedDate, this.currentFilter);
        const activeTab = document.querySelector('.analytics-tab.active');
        if (activeTab) this.renderAnalytics(activeTab.dataset.period);
        Dashboard.updateQuickStats();
    },

    tick() {
        const totalSeconds = this.getCurrentElapsedSeconds();
        if (totalSeconds !== this.lastDisplaySeconds) {
            this.updateDisplay(totalSeconds);
        }
    },

    saveSession(durationSeconds) {
        const sessions = Storage.getSessions();
        const activityType = this.activitySelect?.value || 'hunting';
        const activityLabel = this.activityLabels[activityType] || this.activityLabels.hunting;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - durationSeconds * 1000);

        const session = {
            id: Utils.generateId(),
            date: Utils.getToday(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: durationSeconds,
            activityType,
            activityLabel,
            note: this.noteInput?.value || activityLabel
        };

        sessions.push(session);
        Storage.saveSessions(sessions);
        this.selectedDate = Utils.getToday();
    },

    renderSessionList(date, filterType = 'all') {
        const sessions = Storage.getSessions();
        const targetDate = date || Utils.getToday();
        let targetSessions = sessions.filter(s => s.date === targetDate);
        
        // Apply activity type filter
        if (filterType && filterType !== 'all') {
            targetSessions = targetSessions.filter(s => s.activityType === filterType);
        }

        // Update title
        const titleEl = document.getElementById('sessionsTitle');
        if (titleEl) {
            if (targetDate === Utils.getToday()) {
                titleEl.textContent = "Today's Sessions";
            } else {
                titleEl.textContent = `Sessions for ${Utils.formatDate(targetDate)}`;
            }
        }

        const container = document.getElementById('todaySessions');

        if (targetSessions.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No sessions found</p>';
            document.getElementById('todayTotal').textContent = '0h 0m';
            return;
        }

        container.innerHTML = targetSessions.map(session => `
            <div class="session-item" data-session-id="${session.id}">
                <div class="session-info">
                    <span class="session-activity-badge">${session.activityLabel || '🎯 Bug Hunting'}</span>
                    <span class="session-time">${Utils.formatTime(session.startTime)} - ${Utils.formatTime(session.endTime)}</span>
                    <span class="session-note-text">${BugManager.escapeHtml(session.note || 'No notes')}</span>
                </div>
                <div class="session-actions">
                    <span class="session-duration">${Utils.formatDurationShort(session.duration)}</span>
                    <button class="btn-delete-session" data-id="${session.id}" title="Delete session">✕</button>
                </div>
            </div>
        `).join('');

        // Add delete handlers
        container.querySelectorAll('.btn-delete-session').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this session?')) {
                    this.deleteSession(btn.dataset.id);
                }
            });
        });

        const totalSeconds = targetSessions.reduce((sum, s) => sum + s.duration, 0);
        document.getElementById('todayTotal').textContent = Utils.formatDurationShort(totalSeconds);
    },

    deleteSession(sessionId) {
        let sessions = Storage.getSessions();
        sessions = sessions.filter(s => s.id !== sessionId);
        Storage.saveSessions(sessions);

        this.renderSessionList(this.selectedDate);
        this.renderAnalytics(document.querySelector('.analytics-tab.active').dataset.period);
        Dashboard.updateQuickStats();
    },

    renderAnalytics(period) {
        const sessions = Storage.getSessions();
        const days = period === 'week' ? Utils.getWeekDays() : Utils.getMonthDays();

        // Aggregate data by day
        const dayData = {};
        days.forEach(day => {
            dayData[day] = 0;
        });

        sessions.forEach(session => {
            if (dayData.hasOwnProperty(session.date)) {
                dayData[session.date] += session.duration;
            }
        });

        // Find max for scaling
        const values = Object.values(dayData);
        const maxSeconds = Math.max(...values, 1);

        // Render chart
        const container = document.getElementById('chartContainer');
        const displayDays = period === 'week' ? days : days.filter((_, i) => i % 5 === 0 || i === days.length - 1);

        container.innerHTML = days.map((day, index) => {
            const seconds = dayData[day];
            const height = (seconds / maxSeconds) * 150;
            const date = new Date(day);
            const label = period === 'week'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.getDate();

            const showLabel = period === 'week' || index % 5 === 0 || index === days.length - 1;

            const isSelected = date.toISOString().split('T')[0] === this.selectedDate;
            const barClass = isSelected ? 'chart-bar selected' : 'chart-bar';

            return `
                <div class="${barClass}" onclick="TimeTracker.handleBarClick('${day}')" style="cursor: pointer;">
                    <span class="chart-bar-value">${seconds > 0 ? Utils.formatDurationShort(seconds) : ''}</span>
                    <div class="chart-bar-fill" style="height: ${Math.max(4, height)}px"></div>
                    <span class="chart-bar-label">${showLabel ? label : ''}</span>
                </div>
            `;
        }).join('');

        // Update summary
        const periodSessions = sessions.filter(s => days.includes(s.date));
        const totalSeconds = periodSessions.reduce((sum, s) => sum + s.duration, 0);
        const avgSeconds = days.length > 0 ? totalSeconds / days.length : 0;

        document.getElementById('periodTotal').textContent = Utils.formatDurationShort(totalSeconds);
        document.getElementById('periodAverage').textContent = Utils.formatDurationShort(avgSeconds);
        document.getElementById('periodSessions').textContent = periodSessions.length;
    },

    exportAnalytics() {
        const sessions = Storage.getSessions();
        if (sessions.length === 0) {
            alert('No sessions to export');
            return;
        }

        const headers = ['ID', 'Date', 'Start Time', 'End Time', 'Duration (Seconds)', 'Activity Type', 'Activity Label', 'Note'];
        const csvContent = [
            headers.join(','),
            ...sessions.map(s => {
                return [
                    s.id,
                    s.date,
                    s.startTime,
                    s.endTime,
                    s.duration,
                    s.activityType || '',
                    s.activityLabel || '',
                    `"${(s.note || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `time_tracking_export_${Utils.getToday()}.csv`;
        link.click();
    },

    handleBarClick(dateString) {
        this.selectedDate = dateString;
        this.renderSessionList(dateString, this.currentFilter);
        this.renderAnalytics(document.querySelector('.analytics-tab.active').dataset.period);
    }
};

// Expose TimeTracker for inline handlers and debugging
window.TimeTracker = TimeTracker;

// ===== NAVIGATION =====
const Navigation = {
    init() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                // Update tabs
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                const targetSection = document.getElementById(tab.dataset.tab);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const safeInit = (fn) => {
        try {
            fn();
        } catch (error) {
            console.error(error);
        }
    };

    safeInit(() => Storage.init?.());
    safeInit(() => Navigation.init());
    safeInit(() => Dashboard.init());
    safeInit(() => BugManager.init());
    safeInit(() => TimeTracker.init());
});
