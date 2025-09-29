const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZ3swqODa7c2iLPgSkB0tGaoIgKvmJiLHOJNNz2z3dJQ4CF2Kmvh6niSMo-3792qJyjw/exec';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const urgentTag = document.getElementById('urgent-tag');
const importantTag = document.getElementById('important-tag');
const preview = document.getElementById('quadrant-preview');
const toast = document.getElementById('toast');

let tasks = [];

window.onload = () => {
  fetch(ENDPOINT)
    .then(res => res.json())
    .then(data => {
      tasks = data;
      renderTasks();
    })
    .catch(err => {
      console.error('❌ Failed to load tasks:', err);
      showToast('❌ Failed to load tasks');
    });
};

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const task = createTask(text);
  tasks.push(task);
  renderTasks();
  syncTask('add', task);
  input.value = '';
  urgentTag.checked = false;
  importantTag.checked = false;
  updatePreview();
});

input.addEventListener('input', updatePreview);
urgentTag.addEventListener('change', updatePreview);
importantTag.addEventListener('change', updatePreview);

function createTask(text) {
  const autoUrgent = /urgent|asap|now|follow up|call|email|remind|confirm|schedule|reorder/i.test(text);
  const autoImportant = /important|goal|project|strategy|prepare|review|plan|deck|report|quotation|proposal|client|hospital|invoice/i.test(text);

  return {
    id: Date.now(),
    text,
    done: false,
    urgent: urgentTag.checked || autoUrgent,
    important: importantTag.checked || autoImportant
  };
}

function getQuadrant(task) {
  if (task.urgent && task.important) return 'Q1';
  if (!task.urgent && task.important) return 'Q2';
  if (task.urgent && !task.important) return 'Q3';
  return 'Q4';
}

function getLabel(q) {
  return {
    Q1: 'Do Now',
    Q2: 'Schedule',
    Q3: 'Delegate',
    Q4: 'can wait'
  }[q];
}

function renderTasks() {
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
    const container = document.getElementById(q);
    container.innerHTML = `<h2>${getLabel(q)}</h2>`;
  });

  tasks.forEach(task => {
    const quadrant = getQuadrant(task);
    const container = document.getElementById(quadrant);

    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';

    const span = document.createElement('span');
    span.textContent = task.text;
    span.onclick = () => handleToggle(task);

    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => handleDelete(task);

    li.append(span, del);
    container.appendChild(li);
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
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      showToast(`✅ ${action} successful`);
    } else {
      showToast(`⚠️ ${action} failed`);
    }
  })
  .catch(err => {
    console.error('❌ Sync error:', err);
    showToast('❌ Sync error');
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function updatePreview() {
  const text = input.value.trim();
  const autoUrgent = /urgent|asap|now|follow up|call|email|remind|confirm|schedule|reorder/i.test(text);
  const autoImportant = /important|goal|project|strategy|prepare|review|plan|deck|report|quotation|proposal|client|hospital|invoice/i.test(text);

  const urgent = urgentTag.checked || autoUrgent;
  const important = importantTag.checked || autoImportant;

  const quadrant = getQuadrant({ urgent, important });
  preview.textContent = `Quadrant: ${getLabel(quadrant)}`;
}
