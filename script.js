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
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;

    // 🧠 Quadrant logic with matching font color
    if (task.urgent && task.important) {
      li.style.backgroundColor = '#f0f0f0'; // Neither Urgent nor Important
      li.style.color = '#080808';
      li.dataset.quadrant = 'do-now';
    } else if (task.urgent && !task.important) {
      li.style.backgroundColor = '#fff9e5'; // Urgent but Not Important
      li.style.color = '#080808';
      li.dataset.quadrant = 'delegate';
    } else if (!task.urgent && task.important) {
      li.style.backgroundColor = '#e5f4ff'; // Important but Not Urgent
      li.style.color = '#080808';
      li.dataset.quadrant = 'schedule';
    } else {
      li.style.backgroundColor = '#ecf0f1'; // Light gray
      li.style.color = '#080808';
      li.dataset.quadrant = 'eliminate';
    }

    // Optional: Add user and delete button
    const meta = document.createElement('small');
    meta.textContent = `👤 ${task.user || 'Unknown'}`;
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
