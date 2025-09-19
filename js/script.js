// To-Do List JavaScript Functionality
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = {
            status: 'semua',
            priority: 'semua',
            date: '',
            search: ''
        };
        
        this.init();
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.setDefaultDate();
        this.renderTodos();
        this.updateStats();
    }

    // Bind all event listeners
    bindEvents() {
        // Form submission
        const form = document.getElementById('todo-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Filter events
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.renderTodos();
        });

        document.getElementById('priority-filter').addEventListener('change', (e) => {
            this.currentFilter.priority = e.target.value;
            this.renderTodos();
        });

        document.getElementById('date-filter').addEventListener('change', (e) => {
            this.currentFilter.date = e.target.value;
            this.renderTodos();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value.toLowerCase();
            this.renderTodos();
        });

        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Real-time validation
        document.getElementById('task-input').addEventListener('input', (e) => {
            this.validateTask(e.target.value);
        });

        document.getElementById('date-input').addEventListener('change', (e) => {
            this.validateDate(e.target.value);
        });
    }

    // Set default date to today
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-input').value = today;
    }

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const task = formData.get('task').trim();
        const date = formData.get('date');
        const priority = formData.get('priority');

        // Validate form
        if (!this.validateForm(task, date)) {
            return;
        }

        // Create new todo
        const newTodo = {
            id: Date.now(),
            task: task,
            date: date,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to todos array
        this.todos.unshift(newTodo);
        
        // Save to localStorage
        this.saveTodos();
        
        // Reset form
        e.target.reset();
        this.setDefaultDate();
        this.clearValidationErrors();
        
        // Re-render
        this.renderTodos();
        this.updateStats();
        
        // Show success message
        this.showSuccessMessage('Tugas berhasil ditambahkan!');
    }

    // Validate form inputs
    validateForm(task, date) {
        let isValid = true;
        
        if (!this.validateTask(task)) {
            isValid = false;
        }
        
        if (!this.validateDate(date)) {
            isValid = false;
        }
        
        return isValid;
    }

    // Validate task input
    validateTask(task) {
        const taskError = document.getElementById('task-error');
        
        if (!task || task.trim().length === 0) {
            this.showError('task-error', 'Nama tugas tidak boleh kosong');
            return false;
        }
        
        if (task.trim().length < 3) {
            this.showError('task-error', 'Nama tugas minimal 3 karakter');
            return false;
        }
        
        if (task.trim().length > 100) {
            this.showError('task-error', 'Nama tugas maksimal 100 karakter');
            return false;
        }

        // Check for duplicate tasks
        const isDuplicate = this.todos.some(todo => 
            todo.task.toLowerCase() === task.trim().toLowerCase() && !todo.completed
        );
        
        if (isDuplicate) {
            this.showError('task-error', 'Tugas dengan nama ini sudah ada');
            return false;
        }
        
        this.hideError('task-error');
        return true;
    }

    // Validate date input
    validateDate(date) {
        if (!date) {
            this.showError('date-error', 'Tanggal tidak boleh kosong');
            return false;
        }
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.showError('date-error', 'Tanggal tidak boleh kurang dari hari ini');
            return false;
        }
        
        this.hideError('date-error');
        return true;
    }

    // Show error message
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        errorElement.classList.add('error-message');
    }

    // Hide error message
    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.classList.add('hidden');
        errorElement.classList.remove('error-message');
    }

    // Clear all validation errors
    clearValidationErrors() {
        this.hideError('task-error');
        this.hideError('date-error');
    }

    // Show success message
    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(successDiv, container.children[1]);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    // Render todos
    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        
        // Filter todos
        const filteredTodos = this.filterTodos();
        
        if (filteredTodos.length === 0) {
            if (emptyState) {
                todoList.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                todoList.innerHTML = `
                    <div id="empty-state" class="text-center py-12">
                        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada tugas</h3>
                        <p class="text-gray-500">Mulai dengan menambahkan tugas pertama Anda!</p>
                    </div>
                `;
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // Sort todos by date and priority
        const sortedTodos = this.sortTodos(filteredTodos);
        
        todoList.innerHTML = sortedTodos.map(todo => this.createTodoHTML(todo)).join('');
        
        // Bind individual todo events
        this.bindTodoEvents();
    }

    // Filter todos based on current filters
    filterTodos() {
        return this.todos.filter(todo => {
            // Status filter
            if (this.currentFilter.status === 'selesai' && !todo.completed) return false;
            if (this.currentFilter.status === 'belum-selesai' && todo.completed) return false;
            
            // Priority filter
            if (this.currentFilter.priority !== 'semua' && todo.priority !== this.currentFilter.priority) return false;
            
            // Date filter
            if (this.currentFilter.date && todo.date !== this.currentFilter.date) return false;
            
            // Search filter
            if (this.currentFilter.search && !todo.task.toLowerCase().includes(this.currentFilter.search)) return false;
            
            return true;
        });
    }

    // Sort todos
    sortTodos(todos) {
        return todos.sort((a, b) => {
            // Completed tasks go to bottom
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            
            // Sort by priority
            const priorityOrder = { 'tinggi': 3, 'sedang': 2, 'rendah': 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Sort by date
            return new Date(a.date) - new Date(b.date);
        });
    }

    // Create HTML for a single todo
    createTodoHTML(todo) {
        const formattedDate = this.formatDate(todo.date);
        const isOverdue = this.isOverdue(todo.date) && !todo.completed;
        
        return `
            <div class="task-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="task-content">
                    <div class="task-info">
                        <h3 class="task-title ${isOverdue ? 'text-red-600' : ''}">${this.escapeHtml(todo.task)}</h3>
                        <div class="task-meta">
                            <span class="task-date ${isOverdue ? 'text-red-500 font-semibold' : ''}">${formattedDate}</span>
                            <span class="priority-${todo.priority}">${todo.priority}</span>
                            ${isOverdue ? '<span class="text-red-500 font-semibold">⚠️ Terlambat</span>' : ''}
                            ${todo.completed ? '<span class="text-green-600 font-semibold">✅ Selesai</span>' : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        ${!todo.completed ? 
                            `<button class="btn-complete" data-id="${todo.id}" title="Tandai Selesai">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Selesai
                            </button>` : 
                            `<button class="btn-edit bg-yellow-500 hover:bg-yellow-600" data-id="${todo.id}" title="Batalkan Selesai">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                                </svg>
                                Batal
                            </button>`
                        }
                        <button class="btn-delete" data-id="${todo.id}" title="Hapus Tugas">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Bind events to todo items
    bindTodoEvents() {
        // Complete/Uncomplete buttons
        document.querySelectorAll('.btn-complete, .btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = parseInt(e.target.closest('button').dataset.id);
                this.toggleComplete(todoId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = parseInt(e.target.closest('button').dataset.id);
                this.deleteTodo(todoId);
            });
        });
    }

    // Toggle todo completion status
    toggleComplete(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            
            const message = todo.completed ? 'Tugas berhasil diselesaikan!' : 'Status tugas dibatalkan!';
            this.showSuccessMessage(message);
        }
    }

    // Delete a todo
    deleteTodo(todoId) {
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showSuccessMessage('Tugas berhasil dihapus!');
        }
    }

    // Update statistics
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
    }

    // Clear all filters
    clearFilters() {
        this.currentFilter = {
            status: 'semua',
            priority: 'semua',
            date: '',
            search: ''
        };
        
        document.getElementById('status-filter').value = 'semua';
        document.getElementById('priority-filter').value = 'semua';
        document.getElementById('date-filter').value = '';
        document.getElementById('search-input').value = '';
        
        this.renderTodos();
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('id-ID', options);
    }

    // Check if date is overdue
    isOverdue(dateString) {
        const taskDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate < today;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save todos to localStorage
    saveTodos() {
        try {
            const todosData = {
                todos: this.todos,
                lastUpdated: new Date().toISOString()
            };
            // Note: In a real environment, you would use localStorage here
            // localStorage.setItem('todoApp', JSON.stringify(todosData));
        } catch (error) {
            console.error('Error saving todos:', error);
        }
    }

    // Load todos from localStorage
    loadTodos() {
        try {
            // Note: In a real environment, you would use localStorage here
            // const savedData = localStorage.getItem('todoApp');
            // if (savedData) {
            //     const data = JSON.parse(savedData);
            //     return data.todos || [];
            // }
            return [];
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }

    // Export todos as JSON
    exportTodos() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `todos_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task quickly
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            document.getElementById('todo-form').dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            document.getElementById('search-input').value = '';
            window.todoApp.currentFilter.search = '';
            window.todoApp.renderTodos();
        }
    });
    
    console.log('✅ To-Do List App initialized successfully!');
});