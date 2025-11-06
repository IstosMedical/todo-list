const categories = [
  { id: "leads", title: "🎯 Leads", color: "#FCE4EC" },
  { id: "office", title: "🏢 Office", color: "#F3E5F5" },
  { id: "order", title: "🚚 Orders", color: "#E3F2FD" },
  { id: "personal", title: "🔔 Personal", color: "#FFEBEE" },
  { id: "do", title: "💰 Do-Payments", color: "#E1F5FE" },
  { id: "get", title: "💵 Get-Payments", color: "#E8F5E9" },
  { id: "tobeorder", title: "🧾 To be ordered", color: "#FFFDE7" },
  { id: "service", title: "🛠️ Service", color: "#FFF3E0" }
];

window.onload = () => {
  const grid = document.getElementById("todoGrid");
  categories.forEach(cat => {
    const box = createTodoBox(cat);
    grid.appendChild(box);
  });

  const savedTasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  savedTasks.forEach(({ text, category }) => {
    const container = document.querySelector(`#${category}Box .tasks`);
    if (container) {
      const taskElement = createTaskElement(text, category);
      container.appendChild(taskElement);
    }
  });
};

function handleSubmit(event) {
  event.preventDefault();
  addTask();
}

function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  if (!taskText) return;

  let assignedBox = null;
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox && checkbox.checked) {
      assignedBox = cat.id;
    }
  });

  if (!assignedBox) {
    alert("Please select a category before adding a task.");
    return;
  }

  // === Desktop Grid Update ===
  const desktopContainer = document.querySelector(`#${assignedBox}Box .tasks`);
  if (desktopContainer) {
    const taskElement = createTaskElement(taskText, assignedBox);
    desktopContainer.appendChild(taskElement);
  }

  // === Mobile Card Update ===
  const mobileCards = document.querySelectorAll('#cardStack .card');
  mobileCards.forEach(card => {
    if (card.textContent.includes(catTitle(assignedBox))) {
      const taskItem = document.createElement('div');
      taskItem.className = 'task-item';
      taskItem.textContent = taskText;
      card.appendChild(taskItem);
    }
  });

  // === Save and Reset ===
  saveTask(taskText, assignedBox);
  document.getElementById("taskInput").value = "";
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox) checkbox.checked = false;
  });
}

// Helper to get category title from ID
function catTitle(id) {
  const match = categories.find(c => c.id === id);
  return match ? match.title.replace(/^[^\w\s]/, '').trim() : '';
}

function createTaskElement(text, category) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-item";

  const taskContent = document.createElement("span");
  taskContent.textContent = text;

  const removeBtn = document.createElement("span");
  removeBtn.textContent = "✕";
  removeBtn.className = "remove-btn";
  removeBtn.title = "Remove task";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.marginLeft = "12px";
  removeBtn.onclick = () => {
    taskDiv.remove();
    deleteTask(text, category);
    updateTaskCount(); // Refresh count after deletion
  };

  taskDiv.appendChild(taskContent);
  taskDiv.appendChild(removeBtn);
  return taskDiv;
}

function saveTask(text, category) {
  const tasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  tasks.push({ text, category });
  localStorage.setItem("istosTasks", JSON.stringify(tasks));
  updateTaskCount(); // Refresh count after save
}

function deleteTask(text, category) {
  let tasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  tasks = tasks.filter(task => !(task.text === text && task.category === category));
  localStorage.setItem("istosTasks", JSON.stringify(tasks));
}


// Category definitions with ID, label, and color
// Updates the task count table based on current tasks in each category
function updateTaskCount() {
  const tbody = document.getElementById('taskCountBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  categories.forEach(cat => {
    const box = document.getElementById(`${cat.id}Box`);
    const taskCount = box ? box.querySelectorAll('.task-item').length : 0;

    const row = document.createElement('tr');
    row.innerHTML = `<td>${cat.title}</td><td>${taskCount}</td>`;
    tbody.appendChild(row);
  });
}

// Auto-refresh task count every second
setInterval(updateTaskCount, 1000);


// Swipe-to-Dismiss the cards on mobile device

const stack = document.getElementById('cardStack');
let currentIndex = 0;

function showCard(index) {
  const cards = stack.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.style.zIndex = cards.length - i;
    card.style.opacity = i === index ? '1' : '0';
    card.style.transform = i === index ? 'translateX(0)' : 'translateX(100%)';
  });
}

stack.addEventListener('touchstart', e => {
  stack.startX = e.touches[0].clientX;
});

stack.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const deltaX = endX - stack.startX;

  if (Math.abs(deltaX) > 50) {
    currentIndex = (currentIndex + (deltaX < 0 ? 1 : -1) + stack.children.length) % stack.children.length;
    showCard(currentIndex);
  }
});

showCard(currentIndex);

// Add task to mobile device

function addTaskToMobileCard(taskText, category) {
  const cards = document.querySelectorAll('#cardStack .card');
  for (let card of cards) {
    if (card.textContent.includes(category)) {
      const taskItem = document.createElement('div');
      taskItem.className = 'task-item';
      taskItem.textContent = taskText;
      card.appendChild(taskItem);
      break;
    }
  }
}

