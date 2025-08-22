let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

const taskList = document.getElementById('task-list');
const taskText = document.getElementById('task-text');
const priority = document.getElementById('priority');
const deadline = document.getElementById('deadline');

document.getElementById('add-task').onclick = () => {
  const text = taskText.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    priority: priority.value,
    deadline: deadline.value,
    completed: false
  };
  tasks.push(newTask);
  taskText.value = '';
  deadline.value = '';
  saveAndRender();
};

document.getElementById('toggle-dark').onclick = () => {
  document.body.classList.toggle('dark');
};

document.querySelectorAll('.filters button').forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.filter;
    renderTasks();
  };
});

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  const filtered = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'pending') return !task.completed;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task priority-${task.priority} ${task.completed ? 'completed' : ''}`;

    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.contentEditable = true;
    textSpan.innerText = task.text;
    textSpan.onblur = () => {
      task.text = textSpan.innerText.trim();
      saveAndRender();
    };

    const actions = document.createElement('div');
    actions.className = 'actions';

    const checkBtn = document.createElement('button');
    checkBtn.textContent = task.completed ? '↩️' : '✅';
    checkBtn.onclick = () => {
      task.completed = !task.completed;
      saveAndRender();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveAndRender();
    };

    if (task.deadline) {
      const deadlineSpan = document.createElement('span');
      deadlineSpan.className = 'deadline';
      const today = new Date().toISOString().split('T')[0];
      if (task.deadline < today && !task.completed) {
        deadlineSpan.classList.add('deadline-passed');
      }
      deadlineSpan.innerText = `📅 ${task.deadline}`;
      actions.appendChild(deadlineSpan);
    }

    actions.appendChild(checkBtn);
    actions.appendChild(delBtn);

    li.appendChild(textSpan);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

renderTasks();
