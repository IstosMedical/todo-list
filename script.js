  <!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js"></script>

// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyA7gVA0edDxcs3x0P_IqozAAVNnUMXacVU",
  authDomain: "istos-todo-sync.firebaseapp.com",
  projectId: "istos-todo-sync",
  storageBucket: "istos-todo-sync.firebasestorage.app",
  messagingSenderId: "538717309457",
  appId: "1:538717309457:web:95bd368388f6feea04bfb0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// taskService.js
const TASK_DOC = "sharedList"; // 🔐 Can be made user-specific later

function saveTasksToCloud(tasks) {
  return db.collection("todos").doc(TASK_DOC).set({ tasks });
}

function loadTasksFromCloud() {
  return db.collection("todos").doc(TASK_DOC).get()
    .then(doc => doc.exists ? doc.data().tasks || [] : []);
}

function deleteTaskFromCloud(text, category) {
  return loadTasksFromCloud().then(tasks => {
    const updated = tasks.filter(t => !(t.text === text && t.category === category));
    return saveTasksToCloud(updated);
  });
}

// ui.js
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
    deleteTaskFromCloud(text, category);
  };

  taskDiv.appendChild(taskContent);
  taskDiv.appendChild(removeBtn);
  return taskDiv;
}


// main.js
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

  if (!assignedBox) return alert("Please select a category before adding a task.");

  const task = { text: taskText, category: assignedBox };
  const container = document.querySelector(`#${assignedBox}Box .tasks`);
  if (container) container.appendChild(createTaskElement(taskText, assignedBox));
  addTaskToMobileCard(taskText, assignedBox);

  const currentTasks = await loadTasksFromCloud();
  await saveTasksToCloud([...currentTasks, task]);

  document.getElementById("taskInput").value = "";
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox) checkbox.checked = false;
  });
}




