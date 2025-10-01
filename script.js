document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  let tasks = [];

  form.addEventListener('submit', handleSubmit);

  function handleSubmit(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const task = {
      id: Date.now(),
      text,
      done: false,
      user: 'Naushad'
    };

    tasks.push(task);
    renderTasks();
    showToast('✅ Task added');
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

      const userTag = document.createElement('small');
      userTag.textContent = `👤 ${task.user || 'Unassigned'}`;

      const del = document.createElement('button');
      del.textContent = '✕';
      del.onclick = () => deleteTask(task);

      li.append(span, userTag, del);
      list.appendChild(li);
    });
  }

  function toggleTask(task) {
    task.done = !task.done;
    renderTasks();
  }

  function deleteTask(task) {
    tasks = tasks.filter(t => t.id !== task.id);
    renderTasks();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});
