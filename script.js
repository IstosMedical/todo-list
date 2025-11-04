const categories = [
  { id: "order", title: "🚚 Orders", color: "#E3F2FD" },
  { id: "tobeorder", title: "🧾 To be ordered", color: "#FFFDE7" },
  { id: "get", title: "💵 Payments to Get", color: "#E8F5E9" },
  { id: "service", title: "🛠️ Service", color: "#FFF3E0" },
  { id: "leads", title: "🎯 Leads", color: "#FCE4EC" },
  { id: "office", title: "🏢 Office", color: "#F3E5F5" },
  { id: "reminder", title: "🔔 Personal", color: "#FFEBEE" },
  { id: "do", title: "💰 Payments to Do", color: "#E1F5FE" }
];

// Create boxes on page load
window.onload = () => {
  const grid = document.getElementById("todoGrid");
  categories.forEach(cat => {
    const box = createTodoBox(cat);
    grid.appendChild(box);
  });

  // Load saved tasks
  const savedTasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  savedTasks.forEach(({ text, category }) => {
    const container = document.querySelector(`#${category}Box .tasks`);
    const taskElement = createTaskElement(text, category);
    container.appendChild(taskElement);
  });
};

function handleSubmit(event) {
  event.preventDefault();
  addTask();
}

function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  if (!taskText) return;

  let assignedBox = "others";
  categories.forEach(cat => {
    if (document.getElementById(`${cat.id}Checkbox`).checked) {
      assignedBox = cat.id;
    }
  });

  const container = document.querySelector(`#${assignedBox}Box .tasks`);
  const taskElement = createTaskElement(taskText, assignedBox);
  container.appendChild(taskElement);
  saveTask(taskText, assignedBox);

  document.getElementById("taskInput").value = "";
  categories.forEach(cat => {
    document.getElementById(`${cat.id}Checkbox`).checked = false;
  });
}

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
  removeBtn.onclick = () => {
    taskDiv.remove();
    deleteTask(text, category);
  };

  taskDiv.appendChild(taskContent);
  taskDiv.appendChild(removeBtn);
  return taskDiv;
}

function saveTask(text, category) {
  const tasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  tasks.push({ text, category });
  localStorage.setItem("istosTasks", JSON.stringify(tasks));
}

function deleteTask(text, category) {
  let tasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  tasks = tasks.filter(task => !(task.text === text && task.category === category));
  localStorage.setItem("istosTasks", JSON.stringify(tasks));
}
