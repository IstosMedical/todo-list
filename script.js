const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZ3swqODa7c2iLPgSkB0tGaoIgKvmJiLHOJNNz2z3dJQ4CF2Kmvh6niSMo-3792qJyjw/exec';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');

let tasks = [];

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const task = createTask(text);
  tasks.push(task);
  renderTasks();
  syncTask('add', task);
  input.value = '';
});

function createTask(text) {
  return {
    id: Date.now(),
    text,
    done: false
  };
}

function renderTasks() {
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';

    const span = document.createElement('span');
    span.textContent = task.text;
    span.onclick = () => handleToggle(task);

    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => handleDelete(task);

    li.append(span, del);
    list.appendChild(li);
  });
}

function handleToggle(task) {
  task.done = !task.done;
  renderTasks();
  syncTask('toggle', task);
}

function handleDelete(task) {
  tasks = tasks.filter(t => t.id !== task.id);
  renderTasks();
  syncTask('delete', task);
}

function syncTask(action, task) {
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, task })
  }).catch(err => console.error('Sync failed:', err));
}
