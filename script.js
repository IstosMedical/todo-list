const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZ3swqODa7c2iLPgSkB0tGaoIgKvmJiLHOJNNz2z3dJQ4CF2Kmvh6niSMo-3792qJyjw/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const urgentTag = document.getElementById('urgent-tag');
  const importantTag = document.getElementById('important-tag');
  const preview = document.getElementById('quadrant-preview');
  const toast = document.getElementById('toast');

  let tasks = [];

  form.addEventListener('submit', handleSubmit);
  input.addEventListener('input', updatePreview);
  urgentTag.addEventListener('change', updatePreview);
  importantTag.addEventListener('change', updatePreview);

  loadTasks();

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
      Q4: 'Can Wait'
    }[q];
  }

  function createTask(text) {
    return {
      id: Date.now(),
      text,
      done: false,
      urgent: urgentTag.checked,
      important: importantTag.checked
    };
  }

  async function loadTasks() {
    try {
      const res = await fetch(ENDPOINT);
      tasks = await res.json();
      renderTasks();
    } catch (err) {
      console.error('❌ Failed to load tasks:', err);
      showToast('❌ Failed to load tasks');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const task = createTask(text);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', task })
      });

      const data = await res.json();
      if (data.status === 'success') {
        tasks.push(task);
        renderTasks();
        showToast('✅ Task added');
      } else {
        showToast('⚠️ Sync failed');
      }
    } catch (err) {
      console.error('❌ Sync error:', err);
      showToast('❌ Sync error');
    }

    input.value = '';
    urgentTag.checked = false;
    importantTag.checked = false;
    updatePreview();
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
      li.className = task.done ? 'completed' : '';

      const span = document.createElement('span');
      span.textContent = task.text;
      span.onclick = () => handleToggle(task);

      const urgentCheckbox = document.createElement('input');
      urgentCheckbox.type = 'checkbox';
      urgentCheckbox.checked = task.urgent;
      urgentCheckbox.title = 'Urgent';
      urgentCheckbox.onchange = () => {
        task.urgent = urgentCheckbox.checked;
        renderTasks();
        sync('toggle', task);
      };

      const importantCheckbox = document.createElement('input');
      importantCheckbox.type = 'checkbox';
      importantCheckbox.checked = task.important;
      importantCheckbox.title = 'Important';
      importantCheckbox.onchange = () => {
        task.important = importantCheckbox.checked;
        renderTasks();
        sync('toggle', task);
      };

      const del = document.createElement('button');
      del.textContent = '✕';
      del.onclick = () => handleDelete(task);

      li.append(urgentCheckbox, importantCheckbox, span, del);
      container.appendChild(li);
    });
  }

  function handleToggle(task) {
    task.done = !task.done;
    renderTasks();
    sync('toggle', task);
  }

  function handleDelete(task) {
    tasks = tasks.filter(t => t.id !== task.id);
    renderTasks();
    sync('delete', task);
  }

  async function sync(action, task) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, task })
      });

      const result = await res.json();
      if (!result || result.status !== 'success') throw new Error('Sync failed');
    } catch (err) {
      console.error('❌ Sync error:', err);
      document.getElementById('sync-error').style.display = 'block';
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function updatePreview() {
    const urgent = urgentTag.checked;
    const important = importantTag.checked;
    const quadrant = getQuadrant({ urgent, important });
    preview.textContent = `Quadrant: ${getLabel(quadrant)}`;
  }
});
