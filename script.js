const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZ3swqODa7c2iLPgSkB0tGaoIgKvmJiLHOJNNz2z3dJQ4CF2Kmvh6niSMo-3792qJyjw/exec';

window.onload = () => {
  fetch(ENDPOINT)
    .then(res => res.json())
    .then(data => {
      tasks = data;
      renderTasks();
    })
    .catch(err => console.error('Failed to load tasks:', err));
};

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
    done: false,
        urgent: /urgent|asap|now|follow up|call|email|remind|confirm|reorder/i.test(text),
        important: /important|goal|project|strategy|prepare|review|plan|deck|report|summary|quote|quotation/i.test(text)
  };
}


function renderTasks() {
  list.innerHTML = '';
  const now = Date.now();

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';

    const age = now - task.id;
    const isUrgentKeyword = /urgent|asap|important/i.test(task.text);
    const isOld = age > 3 * 24 * 60 * 60 * 1000;

    if (!task.done && (isUrgentKeyword || isOld)) {
      li.classList.add('urgent');
    }

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

function getQuadrant(task) {
  if (task.urgent && task.important) return 'Q1';
  if (!task.urgent && task.important) return 'Q2';
  if (task.urgent && !task.important) return 'Q3';
  return 'Q4';
}

function renderTasks() {
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
    document.getElementById(q).innerHTML = `<h2>${getLabel(q)}</h2>`;
  });

  tasks.forEach(task => {
    const quadrant = getQuadrant(task);
    const container = document.getElementById(quadrant);

    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';
    li.textContent = task.text;
    container.appendChild(li);
  });
}

function getLabel(q) {
  return {
    Q1: 'Do Now',
    Q2: 'Schedule',
    Q3: 'Delegate',
    Q4: 'Can wait'
  }[q];
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
