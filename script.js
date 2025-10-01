const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZ3swqODa7c2iLPgSkB0tGaoIgKvmJiLHOJNNz2z3dJQ4CF2Kmvh6niSMo-3792qJyjw/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  let tasks = [];

  form.addEventListener('submit', handleSubmit);
  loadTasks();

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

    const task = {
      id: Date.now(),
      text,
      done: false
    };

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
  }

  function renderTasks() {
    list.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = task.done ? 'completed' : '';

      const span = document.createElement('span');
      span.textContent = task.text;
      span.onclick = () => toggleTask(task);

      const del = document.createElement('button');
      del.textContent = '✕';
      del.onclick = () => deleteTask(task);

      li.append(span, del);
      list.appendChild(li);
    });
  }

  function toggleTask(task) {
    task.done = !task.done;
    renderTasks();
    sync('toggle', task);
  }

  function deleteTask(task) {
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
});
