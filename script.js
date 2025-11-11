document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadTasks();
});

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const deadlineInput = document.getElementById('deadline-input');
const taskList = document.getElementById('task-list');

// Function to display current date
function displayCurrentDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = `Today: ${today.toLocaleDateString('en-US', options)}`;
}

// Add task event
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const deadline = deadlineInput.value;
    if (taskText && deadline) {
        addTask(taskText, deadline);
        taskInput.value = '';
        deadlineInput.value = '';
        saveTasks();
    }
});

// Function to add task to DOM
function addTask(text, deadline, completed = false) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('data-deadline', deadline); // Store raw deadline here
    if (completed) li.classList.add('completed');
    
    // Check if overdue
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    if (deadline < today && !completed) {
        li.classList.add('overdue');
    }

    li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
        <span class="task-text">${text} (Deadline: ${formatDate(deadline)})</span>
        <button class="delete-btn">Delete</button>
    `;

    // Checkbox event
    li.querySelector('.task-checkbox').addEventListener('change', function() {
        li.classList.toggle('completed');
        if (li.classList.contains('completed')) {
            li.classList.remove('overdue');
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (deadline < today) li.classList.add('overdue');
        }
        saveTasks();
    });

    // Delete event
    li.querySelector('.delete-btn').addEventListener('click', function() {
        li.remove();
        saveTasks();
    });

    taskList.appendChild(li);
}

// Helper to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Save tasks to localStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(item => {
        const textSpan = item.querySelector('.task-text');
        const text = textSpan.textContent.split(' (Deadline: ')[0]; // Extract text
        const deadline = item.getAttribute('data-deadline'); // Get raw deadline from attribute
        tasks.push({
            text: text,
            deadline: deadline,
            completed: item.classList.contains('completed')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTask(task.text, task.deadline, task.completed));
}