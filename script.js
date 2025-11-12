const TASK_DOC = "sharedList"; // 🔐 This is your Firestore document key

// 🔹 Category Definitions
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

// 🔹 Firebase Sync Functions
async function loadTasksFromCloud() {
  const doc = await db.collection("todos").doc(TASK_DOC).get();
  return doc.exists ? doc.data().tasks || [] : [];
}

async function saveTaskToCloud(text, category) {
  const currentTasks = await loadTasksFromCloud();
  currentTasks.push({ text, category });
  await db.collection("todos").doc(TASK_DOC).set({ tasks: currentTasks });
}

async function deleteTaskFromCloud(text, category) {
  const currentTasks = await loadTasksFromCloud();
  const updated = currentTasks.filter(task => !(task.text === text && task.category === category));
  await db.collection("todos").doc(TASK_DOC).set({ tasks: updated });
}

// 🔹 UI Builders
function createTodoBox({ id, title, color }) {
  const box = document.createElement("div");
  box.className = "todo-box";
  box.id = `${id}Box`;
  box.style.background = `linear-gradient(135deg, ${color}, #ffffff)`;
  box.setAttribute("data-emoji", title.trim().split(" ")[0]);

  const boxTitle = document.createElement("div");
  boxTitle.className = "box-title";
  boxTitle.textContent = title;

  const tasks = document.createElement("div");
  tasks.className = "tasks";

  box.appendChild(boxTitle);
  box.appendChild(tasks);
  return box;
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
  removeBtn.onclick = async () => {
    taskDiv.remove();
    await deleteTaskFromCloud(text, category);
  };

  taskDiv.appendChild(taskContent);
  taskDiv.appendChild(removeBtn);
  return taskDiv;
}

// 🔹 Task Creation
function handleSubmit(event) {
  event.preventDefault();
  addTask();
}

async function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  if (!taskText) return;

  let assignedBox = null;
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox?.checked) assignedBox = cat.id;
  });

  if (!assignedBox) {
    alert("Please select a category before adding a task.");
    return;
  }

  const container = document.querySelector(`#${assignedBox}Box .tasks`);
  if (container) container.appendChild(createTaskElement(taskText, assignedBox));
  addTaskToMobileCard(taskText, assignedBox);
  await saveTaskToCloud(taskText, assignedBox);

  document.getElementById("taskInput").value = "";
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox) checkbox.checked = false;
  });
}

// 🔹 Mobile Card Logic
function addTaskToMobileCard(taskText, category) {
  const cards = document.querySelectorAll('#cardStack .card');
  for (let card of cards) {
    if (card.dataset.category === category) {
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";

      const closeBtn = document.createElement("span");
      closeBtn.textContent = "❌";
      closeBtn.className = "close-btn";
      closeBtn.onclick = async () => {
        taskItem.remove();
        await deleteTaskFromCloud(taskText, category);
      };

      taskItem.textContent = taskText;
      taskItem.appendChild(closeBtn);
      card.appendChild(taskItem);
      break;
    }
  }
}

// 🔹 Task Count Table
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
setInterval(updateTaskCount, 1000);

// 🔹 Swipe-to-Dismiss Mobile Cards
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

// 🔹 Card Activation
const cards = document.querySelectorAll('#cardStack .card');
cards.forEach((card, index) => {
  card.style.setProperty('--index', index);
  card.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

// 🔹 Load Tasks on Page Load
window.onload = async () => {
  const grid = document.getElementById("todoGrid");
  categories.forEach(cat => grid.appendChild(createTodoBox(cat)));

  const savedTasks = await loadTasksFromCloud();
  savedTasks.forEach(({ text, category }) => {
    const container = document.querySelector(`#${category}Box .tasks`);
    if (container) container.appendChild(createTaskElement(text, category));
    addTaskToMobileCard(text, category);
  });
};
