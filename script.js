// Elements
const taskListEl = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-button');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalCancelBtn = document.getElementById('modal-cancel');
const tabs = document.querySelectorAll('.tab');
const themeToggleBtn = document.getElementById('theme-toggle');
const toastContainer = document.getElementById('toast-container');

let tasks = [];
let currentFilter = 'all';
let isEditingTaskId = null;

// Utils
function saveTasks() {
  localStorage.setItem('smartTasks', JSON.stringify(tasks));
}
function loadTasks() {
  const data = localStorage.getItem('smartTasks');
  if (data) {
    try {
      tasks = JSON.parse(data);
    } catch {
      tasks = [];
    }
  }
}
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
function formatDeadline(dl) {
  if (!dl) return '';
  const dt = new Date(dl);
  if (isNaN(dt)) return '';
  return dt.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

// Rendering
function renderTasks() {
  taskListEl.innerHTML = '';
  const filtered = tasks.filter(t => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'completed') return t.completed;
    if (currentFilter === 'pending') return !t.completed;
  });
  if (!filtered.length) {
    const li = document.createElement('li');
    li.textContent = 'No tasks found.';
    li.style.textAlign = 'center';
    li.style.color = '#6b7280';
    taskListEl.appendChild(li);
    return;
  }
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-card';
    li.dataset.priority = task.priority;
    if (task.completed) li.classList.add('completed');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label',
      `Task: ${task.description}, Priority: ${task.priority}, ` +
      `${task.completed ? 'Completed' : 'Pending'}${task.deadline ? ', Deadline: ' + formatDeadline(task.deadline) : ''}`
    );

    const info = document.createElement('div');
    info.className = 'task-info';
    const desc = document.createElement('div');
    desc.className = 'task-desc';
    desc.textContent = task.description;
    info.appendChild(desc);

    if (task.deadline) {
      const dd = document.createElement('div');
      dd.className = 'task-deadline';
      dd.textContent = 'Deadline: ' + formatDeadline(task.deadline);
      info.appendChild(dd);
    }

    li.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-toggle';
    completeBtn.title = task.completed ? 'Mark incomplete' : 'Mark complete';
    completeBtn.setAttribute('aria-label', completeBtn.title);
    completeBtn.innerHTML = task.completed
      ? '<i class="fa-solid fa-check-circle"></i>'
      : '<i class="fa-regular fa-circle"></i>';
    completeBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleComplete(task.id);
    });
    actions.appendChild(completeBtn);

    const editBtn = document.createElement('button');
    editBtn.title = 'Edit task';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(task.id);
    });
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.title = 'Delete task';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteTask(task.id);
    });
    actions.appendChild(deleteBtn);

    li.appendChild(actions);
    taskListEl.appendChild(li);
  });
}

// Task operations
function addTask(task) {
  tasks.push(task);
  saveTasks();
  renderTasks();
  showToast('Task added');
}
function updateTask(updated) {
  const idx = tasks.findIndex(t => t.id === updated.id);
  if (idx !== -1) {
    tasks[idx] = updated;
    saveTasks();
    renderTasks();
    showToast('Task updated');
  }
}
function toggleComplete(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    t.completed = !t.completed;
    saveTasks();
    renderTasks();
    showToast(t.completed ? 'Task completed' : 'Task marked incomplete');
  }
}
function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  showToast('Task deleted');
}

// Modal operations
function openAddModal() {
  isEditingTaskId = null;
  taskForm.reset();
  taskModal.hidden = false;
  taskModal.setAttribute('aria-hidden', 'false');
  taskForm.querySelector('input[name="description"]').focus();
}
function openEditModal(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  isEditingTaskId = id;
  taskForm.description.value = t.description;
  taskForm.priority.value = t.priority;
  taskForm.deadline.value = t.deadline ? t.deadline.slice(0, 16) : '';
  taskModal.hidden = false;
  taskModal.setAttribute('aria-hidden', 'false');
  taskForm.querySelector('input[name="description"]').focus();
}
function closeModal() {
  taskModal.hidden = true;
  taskModal.setAttribute('aria-hidden', 'true');
  isEditingTaskId = null;
}

// Event handlers
addTaskBtn.addEventListener('click', openAddModal);
modalCancelBtn.addEventListener('click', closeModal);
taskModal.addEventListener('click', e => {
  if (e.target === taskModal) closeModal();
});
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(taskForm);
  const newTask = {
    id: isEditingTaskId || Date.now().toString(),
    description: data.get('description').trim(),
    priority: data.get('priority'),
    deadline: data.get('deadline') || null,
    completed: false
  };
  if (!newTask.description) {
    alert('Description is required');
    return;
  }

  if (isEditingTaskId) {
    const existing = tasks.find(t => t.id === isEditingTaskId);
    if (existing) newTask.completed = existing.completed;
    updateTask(newTask);
  } else {
    addTask(newTask);
  }
  closeModal();
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    currentFilter = tab.dataset.filter;
    tabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    renderTasks();
  });
});

// Theme toggle
function loadTheme() {
  const theme = localStorage.getItem('smarttask-theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.body.classList.remove('dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    localStorage.setItem('smarttask-theme', 'dark');
  } else {
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('smarttask-theme', 'light');
  }
});

// Keyboard accessibility
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !taskModal.hidden) closeModal();
});

// Init
loadTasks();
loadTheme();
renderTasks();
