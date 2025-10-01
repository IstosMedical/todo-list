document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const urgentCheckbox = document.getElementById('urgent');
  const importantCheckbox = document.getElementById('important');
  const list = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  let tasks = [];

  form.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  const text = input.value.trim();
  const urgent = urgentCheckbox.checked;
  const important = importantCheckbox.checked;

  if (!text) return;

  const task = {
    id: Date.now(),
    text,
    done: false,
    user: 'Naushad',
    urgent,
    important
  };

  tasks.push(task);
  renderTasks();
  showToast('✅ Task added');

  // 🧹 Reset form for next task
  form.reset(); // clears input and checkboxes
  input.focus(); // puts cursor back in the input field
}

  function renderTasks() {
    list.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = task.done ? 'completed' : '';
      li.style.padding = '10px';
      li.style.marginBottom = '8px';
      li.style.borderRadius = '6px';
      li.style.color = '#fff';

      // Apply quadrant color
      if (task.urgent && task.important) {
        li.style.backgroundColor = '#ffe5e5'; // Red
      } else if (task.urgent && !task.important) {
        li.style.backgroundColor = '#e5f4ff'; // Orange
      } else if (!task.urgent && task.important) {
        li.style.backgroundColor = '#f0f0f0'; // Green
      } else {
        li.style.backgroundColor = '#CCF7FF'; // Blue
      }

      const span = document.createElement('span');
      span.textContent = task.text;
      span.style.cursor = 'pointer';
      span.onclick = () => toggleTask(task);

      const userTag = document.createElement('small');
      userTag.textContent = `👤 ${task.user || 'Unassigned'}`;
      userTag.style.display = 'block';
      userTag.style.marginTop = '4px';

      const del = document.createElement('button');
      del.textContent = '✕';
      del.style.marginLeft = '10px';
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
