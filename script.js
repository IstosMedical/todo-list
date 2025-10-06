document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  const checkboxes = [
    'urgent', 'important', 'service', 'orders',
    'payments', 'office', 'reminder', 'other'
  ].reduce((acc, id) => {
    acc[id] = document.getElementById(id);
    return acc;
  }, {});

  let tasks = [];

  // 🕒 Format timestamp
  const getTimestamp = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    return `${hours}:${minutes} - ${dayName}`;
  };

  // ✅ Handle form submission
  const handleSubmit = (e) => {
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

    checkboxesKeys().forEach(key => {
      task[key] = checkboxes[key].checked;
    });

    tasks.push(task);
    renderTasks();
    showToast('✅ Task added');
    form.reset();
    input.focus();
  };

  const checkboxesKeys = () => Object.keys(checkboxes);

  // 🧠 Render all tasks
  const renderTasks = () => {
    list.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      applyResponsiveLayout(li);
      li.style.color = '#000';
      li.style.backgroundColor = index % 2 === 0 ? '#f5cef0' : '#E7D4FF';

      const leftDiv = buildLeftBlock(task);
      const rightDiv = buildRightBlock(task);

      li.appendChild(leftDiv);
      li.appendChild(rightDiv);
      list.appendChild(li);
    });
  };

  // 📱 Responsive layout
  const applyResponsiveLayout = (li) => {
    const isMobile = window.innerWidth < 600;
    li.style.display = 'flex';
    li.style.flexDirection = isMobile ? 'column' : 'row';
    li.style.alignItems = isMobile ? 'stretch' : 'center';
    li.style.justifyContent = 'space-between';
    li.style.gap = isMobile ? '0.5rem' : '0';
  };

  // 🧩 Build left block (text + categories + user)
  const buildLeftBlock = (task) => {
    const leftDiv = document.createElement('div');
    leftDiv.style.display = 'flex';
    leftDiv.style.flexDirection = 'column';
    leftDiv.style.alignItems = 'flex-start';

    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'center';

    const leftSpan = document.createElement('span');
    leftSpan.textContent = task.text;

    const categories = checkboxesKeys().filter(key => task[key]);
    if (categories.length) {
      const catSpan = document.createElement('span');
      catSpan.textContent = ' [' + categories.map(labelize).join(', ') + ']';
      catSpan.style.fontSize = 'smaller';
      catSpan.style.color = '#888';
      catSpan.style.marginLeft = '8px';
      titleRow.appendChild(leftSpan);
      titleRow.appendChild(catSpan);
    } else {
      titleRow.appendChild(leftSpan);
    }

    const meta = document.createElement('small');
    meta.textContent = `👤 ${task.user || 'Unknown'}`;
    meta.style.marginTop = '4px';
    meta.style.color = '#333';

    leftDiv.appendChild(titleRow);
    leftDiv.appendChild(meta);
    return leftDiv;
  };

  // ⏱️ Build right block (timestamp + delete)
  const buildRightBlock = (task) => {
    const rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.alignItems = 'center';

    const rightSpan = document.createElement('span');
    rightSpan.textContent = `🕒 ${task.timestamp}`;
    rightSpan.style.marginLeft = '12px';
    rightSpan.style.fontSize = 'smaller';
    rightSpan.style.color = '#555';

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Delete task';
    delBtn.style.marginLeft = '8px';
    delBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    };

    rightDiv.appendChild(rightSpan);
    rightDiv.appendChild(delBtn);
    return rightDiv;
  };

  // 🏷️ Label mapping
  const labelize = (key) => {
    const map = {
      urgent: ' ⏰Urgent',
      important: '⚡Priority',
      service: '🛠️Service',
      orders: '📦Orders',
      payments: '💳Payments',
      office: '🏢Office',
      reminder: '🔔Reminder',
      other: '🗂Other'
    };
    return map[key] || key;
  };

  // 🔔 Toast message
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  form.addEventListener('submit', handleSubmit);
});



async function submitTask() {
  const task = {
    title: document.getElementById("taskInput").value,
    urgent: document.getElementById("urgentCheckbox").checked,
    priority: document.getElementById("priorityCheckbox").checked,
    completed: false
  };

  try {
    const response = await fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
      method: "POST",
      body: JSON.stringify(task),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.text();
    console.log("✅ Synced:", result);
    alert("Task synced to NAS!");
  } catch (error) {
    console.error("❌ Sync failed:", error);
    alert("Failed to sync task.");
  }
}
