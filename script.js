document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const urgentCheckbox = document.getElementById('Urgent');
  const importantCheckbox = document.getElementById('Priority');
  const serviceCheckbox = document.getElementById('Service');
  const ordersCheckbox = document.getElementById('Orders');
  const paymentsCheckbox = document.getElementById('Payments');
  const officeCheckbox = document.getElementById('Office');
  const reminderCheckbox = document.getElementById('Reminder');
  const otherCheckbox = document.getElementById('Others');
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
    const important = priorityCheckbox.checked;
    const service = serviceCheckbox.checked;
    const orders = ordersCheckbox.checked;
    const payments = paymentsCheckbox.checked;
    const office = officeCheckbox.checked;
    const reminder = reminderCheckbox.checked;
    const other = othersCheckbox.checked;

    if (!text) return;

    const task = {
      id: Date.now(),
      text,
      done: false,
      user: 'Naushad',
      urgent,
      important,
      service,
      orders,
      payments,
      office,
      reminder,
      other,
      timestamp: getTimestamp()
    };

    tasks.push(task);
    renderTasks();
    showToast('✅ Task added');

    form.reset();
    input.focus();
  }

  function renderTasks() {
    list.innerHTML = '';

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';

      // Alternate background colors
      li.style.color = '#000';
      li.style.backgroundColor = (index % 2 === 0) ? '#adf2ef' : '#fff3d0';

      // Left: Task info (title + categories + user)
      const leftDiv = document.createElement('div');
      leftDiv.style.display = 'flex';
      leftDiv.style.flexDirection = 'column';
      leftDiv.style.alignItems = 'flex-start'; // Align content to the left

      const leftSpan = document.createElement('span');
      leftSpan.textContent = task.text;

      // Show selected categories
      const categories = [];
      if (task.urgent) categories.push('Urgent');
      if (task.important) categories.push('Priority');
      if (task.service) categories.push('Service');
      if (task.orders) categories.push('Orders');
      if (task.payments) categories.push('Payments');
      if (task.office) categories.push('Office');
      if (task.reminder) categories.push('Reminder');
      if (task.other) categories.push('Others');
      if (categories.length) {
        const catSpan = document.createElement('span');
        catSpan.textContent = ' [' + categories.join(', ') + ']';
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

      // Right: Timestamp + delete button
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

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});
