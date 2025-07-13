class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'none';
        this.taskIdCounter = 1;

        this.initializeEventListeners();
        this.updateStats();
    }

    initializeEventListeners() {
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        document.getElementById('taskContainer').addEventListener('click', (e) => {
            e.stopPropagation();

            const taskId = parseInt(e.target.dataset.taskId);

            if (e.target.classList.contains('complete-btn')) {
                this.toggleTaskCompletion(taskId, true);
            } else if (e.target.classList.contains('uncomplete-btn')) {
                this.toggleTaskCompletion(taskId, false);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(taskId);
            }
        });

        document.getElementById('showAllBtn').addEventListener('click', () => {
            this.setFilter('all');
        });

        document.getElementById('showCompletedBtn').addEventListener('click', () => {
            this.setFilter('completed');
        });

        document.getElementById('showPendingBtn').addEventListener('click', () => {
            this.setFilter('pending');
        });

        document.getElementById('sortPriorityBtn').addEventListener('click', () => {
            this.toggleSort();
        });
    }

    addTask() {
        try {
            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const priority = document.querySelector('input[name="priority"]:checked')?.value;

            if (!title) {
                this.showError('Görev başlığı boş olamaz!');
                return;
            }

            if (!priority) {
                this.showError('Lütfen bir öncelik seviyesi seçin!');
                return;
            }

            const newTask = {
                id: this.taskIdCounter++,
                title,
                description,
                priority,
                completed: false,
                createdAt: new Date()
            };

            this.tasks.push(newTask);
            this.clearForm();
            this.hideError();
            this.renderTasks();
            this.updateStats();
            this.showSuccessMessage('Görev başarıyla eklendi! 🎉');

        } catch (error) {
            console.error('Görev eklenirken hata oluştu:', error);
            this.showError('Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    toggleTaskCompletion(taskId, completed) {
        try {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = completed;
                this.renderTasks();
                this.updateStats();
            }
        } catch (error) {
            console.error('Görev durumu güncellenirken hata oluştu:', error);
            this.showError('Görev durumu güncellenemedi.');
        }
    }

    deleteTask(taskId) {
        try {
            if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.renderTasks();
                this.updateStats();
                this.showSuccessMessage('Görev silindi! 🗑️');
            }
        } catch (error) {
            console.error('Görev silinirken hata oluştu:', error);
            this.showError('Görev silinemedi.');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

        if (filter === 'all') {
            document.getElementById('showAllBtn').classList.add('active');
        } else if (filter === 'completed') {
            document.getElementById('showCompletedBtn').classList.add('active');
        } else if (filter === 'pending') {
            document.getElementById('showPendingBtn').classList.add('active');
        }

        this.renderTasks();
    }

    toggleSort() {
        const sortBtn = document.getElementById('sortPriorityBtn');
        if (this.currentSort === 'none') {
            this.currentSort = 'priority';
            sortBtn.classList.add('active');
            sortBtn.textContent = '🔄 Öncelik Sıralı';
        } else {
            this.currentSort = 'none';
            sortBtn.classList.remove('active');
            sortBtn.textContent = '🔄 Önceliğe Göre Sırala';
        }
        this.renderTasks();
    }

    getFilteredAndSortedTasks() {
        let filteredTasks = [...this.tasks];

        if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }

        if (this.currentSort === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        }

        return filteredTasks;
    }

    renderTasks() {
        const container = document.getElementById('taskContainer');
        const tasks = this.getFilteredAndSortedTasks();

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>🎯 ${this.getEmptyStateMessage()}</h3>
                    <p>${this.getEmptyStateSubtext()}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="priority-badge ${task.priority}">
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                </div>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                <div class="task-actions">
                    ${task.completed
                        ? `<button class="task-btn uncomplete-btn" data-task-id="${task.id}">↩️ Geri Al</button>`
                        : `<button class="task-btn complete-btn" data-task-id="${task.id}">✅ Tamamla</button>`}
                    <button class="task-btn delete-btn" data-task-id="${task.id}">🗑️ Sil</button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Düşük',
            medium: 'Orta',
            high: 'Yüksek'
        };
        return labels[priority] || priority;
    }

    getEmptyStateMessage() {
        if (this.currentFilter === 'completed') {
            return 'Henüz tamamlanmış görev yok';
        } else if (this.currentFilter === 'pending') {
            return 'Bekleyen görev bulunmuyor';
        }
        return 'Henüz görev eklemediniz';
    }

    getEmptyStateSubtext() {
        if (this.currentFilter === 'completed') {
            return 'Görevlerinizi tamamladığınızda burada görünecek.';
        } else if (this.currentFilter === 'pending') {
            return 'Tüm görevleriniz tamamlanmış! 🎉';
        }
        return 'Yukarıdaki formu kullanarak yeni görevler ekleyebilirsiniz.';
    }

    clearForm() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.querySelectorAll('input[name="priority"]').forEach(radio => {
            radio.checked = false;
        });
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'error-message';
        successDiv.style.background = '#d4edda';
        successDiv.style.color = '#155724';
        successDiv.style.borderLeftColor = '#28a745';
        successDiv.style.display = 'block';
        successDiv.textContent = message;

        const form = document.getElementById('taskForm');
        form.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
