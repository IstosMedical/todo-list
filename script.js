document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const urgentCheckbox = document.getElementById('urgent');
  const importantCheckbox = document.getElementById('important');
  const list = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  let tasks = [];

  form.addEventListener('submit', handleSubmit);

  function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()];
    return `${hours}:${minutes} - ${dayName}`;
  }

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
      important,
      timestamp: getTimestamp() // <-- Add timestamp here
    };

    tasks.push(task);
    renderTasks();
    showToast('✅ Task added');

    // 🧹 Reset form for next task
    form.reset();
    input.focus();
  }

function renderTasks() {
  list.innerHTML = '';

  tasks.forEach(task => {
    // Create the task container with flex layout
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between'; // Title left, timestamp right

    // Create left section (task text)
    const leftSpan = document.createElement('span');
    leftSpan.textContent = task.text;

    // Create right section (timestamp)
    const rightSpan = document.createElement('span');
    rightSpan.textContent = `🕒 ${task.timestamp}`;
    rightSpan.style.marginLeft = '16px'; // Extra spacing
    rightSpan.style.fontSize = 'smaller';
    rightSpan.style.color = '#555';

    li.appendChild(leftSpan);
    li.appendChild(rightSpan);

    // 🧠 Quadrant logic with matching font color
    li.style.color = '#000';
    if (task.urgent && task.important) {
      li.style.backgroundColor = '#77cfff';
      li.dataset.quadrant = 'do-now';
    } else if (task.urgent && !task.important) {
      li.style.backgroundColor = '#ece5dd';
      li.dataset.quadrant = 'delegate';
    } else if (!task.urgent && task.important) {
      li.style.backgroundColor = '#fff9e5';
      li.dataset.quadrant = 'schedule';
    } else {
      li.style.backgroundColor = '#f0f0f0';
      li.dataset.quadrant = 'eliminate';
    }

    // User and delete button
    const meta = document.createElement('small');
    meta.textContent = ` 👤 ${task.user || 'Unknown'}`;
    meta.style.marginLeft = '8px';
    li.appendChild(meta);

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    };
    li.appendChild(delBtn);

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

