const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');

let tasks = [];

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    const task = { id: Date.now(), text, done: false };
    tasks.push(task);
    input.value = '';
    renderTasks();
  }
});

function renderTasks() {
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';
    
    const span = document.createElement('span');
    span.textContent = task.text;
    span.onclick = () => toggleTask(task.id);

    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => deleteTask(task.id);

    li.append(span, del);
    list.appendChild(li);
  });
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}
