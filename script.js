document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const descInput = document.getElementById('task-desc');
  const urgentCheckbox = document.getElementById('urgent');
  const importantCheckbox = document.getElementById('important');
  const serviceCheckbox = document.getElementById('service');
  const ordersCheckbox = document.getElementById('orders');
  const paymentsCheckbox = document.getElementById('payments');
  const officeCheckbox = document.getElementById('office');
  const reminderCheckbox = document.getElementById('reminder');
  const otherCheckbox = document.getElementById('other');
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
    const description = descInput.value.trim();
    const urgent = urgentCheckbox.checked;
    const important = importantCheckbox.checked;
    const service = serviceCheckbox.checked;
    const orders = ordersCheckbox.checked;
    const payments = paymentsCheckbox.checked;
    const office = officeCheckbox.checked;
    const reminder = reminderCheckbox.checked;
    const other = otherCheckbox.checked;

    if (!text) return;

    const task = {
      id: Date.now(),
      text,
      description,
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

    // 🧹 Reset form for next task
    form.reset();
    input.focus();
  }

  function renderTasks() {
    list.innerHTML = '';

    tasks.forEach(task => {
      // Flex container for row layout
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';

      // LEFT: Task info (text, categories, meta, description)
      const leftDiv = document.createElement('div');
      leftDiv.style.display = 'flex';
      leftDiv.style.flexDirection = 'column';

      // Main row: title + categories
      const titleRow = document.createElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';

      const leftSpan = document.createElement('span');
      leftSpan.textContent = task.text;

      // Show selected categories
      const categories = [];
      if (task.service) categories.push('Service');
      if (task.orders) categories.push('Orders');
      if (task.payments) categories.push('Payments');
      if (task.office) categories.push('Office');
      if (task.reminder) categories.push('Reminder');
      if (task.other) categories.push('Other');
      if (categories.length) {
        const catSpan = document.createElement('span');
        catSpan.textContent = ' [' + categories.join(', ') + ']';
        catSpan.style.fontSize = 'smaller';
        catSpan.style.color = '#888';
        catSpan.style.marginLeft = '8px';
        titleRow.appendChild(leftSpan);
        titleRow.appendChild(catSpan);
      } else {
        titleRow.appendChild(leftSpan);
      }

      leftDiv.appendChild(titleRow);

      // Description/Notes (show if present)
      if (task.description) {
        const descDiv = document.createElement('div');
        descDiv.textContent = task.description;
        descDiv.style.fontSize = 'smaller';
        descDiv.style.color = '#555';
        descDiv.style.marginTop = '3px';
        leftDiv.appendChild(descDiv);
      }

      // User meta
      const meta = document.createElement('small');
      meta.textContent = `👤 ${task.user || 'Unknown'}`;
      meta.style.marginTop = '3px';
      leftDiv.appendChild(meta);

      // RIGHT: Timestamp, edit, delete
      const rightDiv = document.createElement('div');
      rightDiv.style.display = 'flex';
      rightDiv.style.alignItems = 'center';

      // Timestamp right
      const rightSpan = document.createElement('span');
      rightSpan.textContent = `🕒 ${task.timestamp}`;
      rightSpan.style.marginLeft = '12px';
      rightSpan.style.fontSize = 'smaller';
      rightSpan.style.color = '#555';
      rightDiv.appendChild(rightSpan);

      // Edit button for description
      const editBtn = document.createElement('button');
      editBtn.textContent = '✎';
      editBtn.title = 'Edit task notes/description';
      editBtn.style.marginLeft = '8px';
      editBtn.onclick = () => {
        const newDesc = prompt('Edit notes/links:', task.description || '');
        if (newDesc !== null) {
          task.description = newDesc;
          renderTasks();
        }
      };
      rightDiv.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Delete task';
      delBtn.style.marginLeft = '8px';
      delBtn.onclick = () => {
        tasks = tasks.filter(t => t.id !== task.id);
        renderTasks();
      };
      rightDiv.appendChild(delBtn);

      // Set quadrant color logic
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

      li.appendChild(leftDiv);
      li.appendChild(rightDiv);

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
