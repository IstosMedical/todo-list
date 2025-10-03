document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  // Checkbox references
  const checkboxes = {
    urgent: document.getElementById('urgent'),
    important: document.getElementById('important'),
    service: document.getElementById('service'),
    orders: document.getElementById('orders'),
    payments: document.getElementById('payments'),
    office: document.getElementById('office'),
    reminder: document.getElementById('reminder'),
    other: document.getElementById('other')
  };
  const list = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  let tasks = [];

  // Helper: Get formatted time
  function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    return `${hours}:${minutes} - ${dayName}`;
  }

  // --- FORM SUBMIT HANDLER ---
  function handleSubmit(e) {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    const task = {
      id: Date.now(),
      text,
      done: false,
      user: 'Naushad',
      timestamp: getTimestamp()
    };

    // Attach checkbox state as properties
    for (let key in checkboxes) {
      task[key] = checkboxes[key].checked;
    }

    tasks.push(task);
    renderTasks();
    showToast('✅ Task added');

    form.reset();
    input.focus();
  }

  // --- RENDER TASKS ---
  function renderTasks() {
    list.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.color = '#000';
      li.style.backgroundColor = (index % 2 === 0) ? '#adf2ef' : '#fff1c8';

      // --- Left: task text + categories + user meta ---
      const leftDiv = document.createElement('div');
      leftDiv.style.display = 'flex';
      leftDiv.style.alignItems = 'center';

      const leftSpan = document.createElement('span');
      leftSpan.textContent = task.text;

      // Categories dynamically
      const catList = [];
      if (task.urgent) catList.push('Urgent');
      if (task.important) catList.push('Priority');
      if (task.service) catList.push('Service');
      if (task.orders) catList.push('Orders');
      if (task.payments) catList.push('Payments');
      if (task.office) catList.push('Office');
      if (task.reminder) catList.push('Reminder');
      if (task.other) catList.push('Other');
      if (catList.length) {
        const catSpan = document.createElement('span');
        catSpan.textContent = ' [' + catList.join(', ') + ']';
        catSpan.style.fontSize = 'smaller';
        catSpan.style.color = '#888';
        catSpan.style.marginLeft = '8px';
        leftDiv.appendChild(leftSpan);
        leftDiv.appendChild(catSpan);
      } else {
        leftDiv.appendChild(leftSpan);
      }

      // User meta
      const meta = document.createElement('small');
      meta.textContent = `👤 ${task.user || 'Unknown'}`;
      meta.style.marginLeft = '8px';
      leftDiv.appendChild(meta);

      // --- Right: timestamp + delete button ---
      const rightDiv = document.createElement('div');
      rightDiv.style.display = 'flex';
      rightDiv.style.alignItems = 'center';

      const rightSpan = document.createElement('span');
      rightSpan.textContent = `🕒 ${task.timestamp}`;
      rightSpan.style.marginLeft = '12px';
      rightSpan.style.fontSize = 'smaller';
      rightSpan.style.color = '#555';
      rightDiv.appendChild(rightSpan);

      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Delete task';
      delBtn.style.marginLeft = '8px';
      delBtn.onclick = () => {
        tasks = tasks.filter(t => t.id !== task.id);
        renderTasks();
      };
      rightDiv.appendChild(delBtn);

      li.appendChild(leftDiv);
      li.appendChild(rightDiv);

      list.appendChild(li);
    });
  }

  // --- Toast message ---
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Bind submit
  form.addEventListener('submit', handleSubmit);
});
