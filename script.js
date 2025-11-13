const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

// Set default date to today and time to 9 AM
window.addEventListener('load', () => {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    timeInput.value = '09:00';
});

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks() {
    taskList.innerHTML = '';
    const now = new Date();

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) {
            li.classList.add('completed');
        } else {
            // Check if deadline passed
            if (task.dueDateTime && !task.completed) {
                const dueDateTime = new Date(task.dueDateTime);
                if (now > dueDateTime) {
                    li.classList.add('late');
                }
            }
        }

        // Create task info container
        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';

        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        // Format due date and time
        let dueInfo = 'No deadline';
        let statusInfo = '';
        if (task.dueDateTime) {
            const dueDate = new Date(task.dueDateTime);
            dueInfo = `${formatDate(dueDate)} at ${formatTime(dueDate)}`;
            
            // Calculate time remaining
            const diffMs = dueDate - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.ceil(diffMs / (1000 * 60));

            if (task.completed) {
                statusInfo = '✓ Completed';
            } else if (diffMs < 0) {
                const overdueDays = Math.abs(diffDays);
                if (overdueDays === 1) {
                    statusInfo = '❌ Overdue by 1 day';
                } else if (overdueDays > 1) {
                    statusInfo = `❌ Overdue by ${overdueDays} days`;
                } else {
                    // Less than 1 day overdue (could be hours/minutes)
                    const overdueHours = Math.abs(diffHours);
                    if (overdueHours === 1) {
                        statusInfo = '❌ Overdue by 1 hour';
                    } else if (overdueHours > 1) {
                        statusInfo = `❌ Overdue by ${overdueHours} hours`;
                    } else {
                        statusInfo = '❌ Overdue';
                    }
                }
            } else if (diffMinutes < 60) {
                if (diffMinutes === 1) {
                    statusInfo = '⏱️ Due in 1 minute';
                } else {
                    statusInfo = `⏱️ Due in ${diffMinutes} minutes`;
                }
            } else if (diffHours < 24) {
                if (diffHours === 1) {
                    statusInfo = '⏱️ Due in 1 hour';
                } else {
                    statusInfo = `⏱️ Due in ${diffHours} hours`;
                }
            } else if (diffDays === 1) {
                statusInfo = '⏰ Due tomorrow';
            } else {
                statusInfo = `⏰ Due in ${diffDays} days`;
            }
        }

        const taskDate = document.createElement('div');
        taskDate.className = 'task-date';
        taskDate.textContent = dueInfo;

        const taskStatus = document.createElement('div');
        taskStatus.className = 'task-status';
        taskStatus.textContent = statusInfo;

        taskInfo.appendChild(taskText);
        taskInfo.appendChild(taskDate);
        taskInfo.appendChild(taskStatus);

        // Click to toggle complete
        li.addEventListener('click', () => {
            if (!event.target.closest('button')) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            }
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        // Append everything
        li.appendChild(taskInfo);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

addBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const dueDate = dateInput.value;
    const dueTime = timeInput.value;

    if (text) {
        // Combine date and time into a single datetime
        let dueDateTime = null;
        if (dueDate) {
            dueDateTime = new Date(dueDate + 'T' + dueTime);
        }

        tasks.push({
            text,
            completed: false,
            dueDateTime: dueDateTime ? dueDateTime.getTime() : null
        });
        taskInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];
        timeInput.value = '09:00';
        saveTasks();
        renderTasks();
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// Auto-check for late tasks every minute
setInterval(() => {
    renderTasks(); // Re-render to update "late" status and time remaining
}, 60000);

// Initialize
renderTasks();
