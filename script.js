// 🔹 Firebase Setup
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

let currentUserId = null;

// 🔹 Categories
const categories = [
  { id: "Toppriority", title: "🔹 Top-Priority", color: "#E8F5E9" },
  { id: "leads", title: "🎯 Leads", color: "#FCE4EC" },
  { id: "office", title: "🏢 Office", color: "#F3E5F5" },
  { id: "order", title: "📤 Orders", color: "#E3F2FD" },
  { id: "personal", title: "🔔 Personal", color: "#FFEBEE" },
  { id: "doget", title: "💰 Do | Get Payments", color: "#E1F5FE" },  
  { id: "tobeorder", title: "🧾 To be ordered", color: "#FFFDE7" },
  { id: "service", title: "🛠️ Service", color: "#FFF3E0" }
];

// 🔹 Auth
function handleLogin() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUserId = userCredential.user.uid;
      initUserSession();
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}

function handleLogout() {
  firebase.auth().signOut().then(() => {
    currentUserId = null;
    document.getElementById("taskForm").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("todoGrid").innerHTML = "";
  });
}

// 🔹 Task CRUD (Cloud)
async function loadTasks(userId) {
  const doc = await db.collection("todos").doc(userId).get();
  const tasks = doc.exists ? doc.data().tasks || [] : [];

  // Clear all boxes
  categories.forEach(cat => {
    const container = document.querySelector(`#${cat.id}Box .tasks`);
    if (container) container.innerHTML = "";
  });

  // Render tasks into boxes
  tasks.forEach(({ text, category }) => {
    const container = document.querySelector(`#${category}Box .tasks`);
    if (container) container.appendChild(createTaskElement(text, category));
  });
}

async function saveTaskToCloud(text, category) {
  const task = { text, category };
  await db.collection("todos").doc(currentUserId).set(
    { tasks: firebase.firestore.FieldValue.arrayUnion(task) },
    { merge: true }
  );
}

async function deleteTaskFromCloud(text, category) {
  const doc = await db.collection("todos").doc(currentUserId).get();
  const currentTasks = doc.exists ? doc.data().tasks || [] : [];
  const updated = currentTasks.filter(task => !(task.text === text && task.category === category));
  await db.collection("todos").doc(currentUserId).set({ tasks: updated });
}

// 🔹 UI Renderers
function createTodoBox({ id, title, color }) {
  const box = document.createElement("div");
  box.className = "todo-box";
  box.id = `${id}Box`;
  box.style.background = `linear-gradient(135deg, ${color}, #ffffff)`;

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
    updateTaskCount();
  };

  taskDiv.appendChild(taskContent);
  taskDiv.appendChild(removeBtn);
  return taskDiv;
}

// 🔹 Tasks: Add, Submit Handler
function handleSubmit(event) {
  event.preventDefault();
  addTask();
}

async function addTask() {
  const rawInput = document.getElementById("taskInput").value.trim();
  if (!rawInput) return;

  let assignedBox = null;
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox?.checked) assignedBox = cat.id;
  });

  if (!assignedBox) {
    alert("Please select a category before adding tasks.");
    return;
  }

  // Split by newline and filter empty lines
  const taskLines = rawInput.split(/\r?\n/).map(line => line.trim()).filter(line => line);

  for (const taskText of taskLines) {
    const container = document.querySelector(`#${assignedBox}Box .tasks`);
    if (container) container.appendChild(createTaskElement(taskText, assignedBox));
    await saveTaskToCloud(taskText, assignedBox);
  }

  document.getElementById("taskInput").value = "";
  categories.forEach(cat => {
    const checkbox = document.getElementById(`${cat.id}Checkbox`);
    if (checkbox) checkbox.checked = false;
  });
  updateTaskCount();
}

// 🔹 Task Count, Badge, Toast & Rain Logic
function updateTaskCount() {
  const tbody = document.getElementById('taskCountBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  categories.forEach(cat => {
    const box = document.getElementById(`${cat.id}Box`);
    const taskCount = box ? box.querySelectorAll('.task-item').length : 0;

    // Update the summary row
    const row = document.createElement('tr');
    row.innerHTML = `<td>${cat.title}</td><td>${taskCount}</td>`;
    tbody.appendChild(row);

    // Badge, Toast & Dot Rain logic
    const boxTitle = box.querySelector('.box-title');
    if (!boxTitle) return;

    let badge = boxTitle.querySelector('.badge-medal');
    const milestoneReached = boxTitle.getAttribute('data-milestone') === 'true';

    if (taskCount >= 10) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'badge-medal';
        badge.title = 'Medal for 10+ tasks';
        badge.style.marginLeft = '8px';
        badge.style.color = '#FFD700';
        badge.textContent = '🏅';
        boxTitle.appendChild(badge);
      }
      // Show rain & toast only the FIRST time milestone is achieved
      if (!milestoneReached) {
        showDotRain(cat.id);
        showToast();
        boxTitle.setAttribute('data-milestone', 'true');
      }
    } else {
      if (badge) badge.remove();
      boxTitle.setAttribute('data-milestone', 'false');
    }
  });
}

function showDotRain(categoryId) {
  const box = document.getElementById(`${categoryId}Box`);
  if (!box) return;

  // Remove any previous rain container
  const prevContainer = box.querySelector('.rain-dot-container');
  if (prevContainer) prevContainer.remove();

  // Make a new container for this rain event
  const rainContainer = document.createElement('div');
  rainContainer.className = 'rain-dot-container';
  box.appendChild(rainContainer);

  // Generate 14 rain dots with random colors/positions/delays
  for (let i = 0; i < 14; i++) {
    const dot = document.createElement('div');
    dot.className = 'rain-dot';
    dot.style.left = (Math.random() * 90) + '%';
    dot.style.background = `radial-gradient(circle at 30% 40%, 
      ${['#40c4ff','#ffd600','#ff4081','#69f0ae','#ffd600','#ffab00'][Math.floor(Math.random() * 6)]} 0%,
      #fffde7 100%)`;
    dot.style.animationDelay = (Math.random() * 1.35) + 's';
    rainContainer.appendChild(dot);
  }

  // Remove the rain container after the longest animation (max 3s)
  setTimeout(() => {
    rainContainer.remove();
  }, 3000);
}

// 🔹 Toast Logic
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('toast-hidden');
  setTimeout(() => {
    toast.classList.add('toast-hidden');
  }, 3200);
}

// 🔹 User Session
async function initUserSession() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("taskForm").style.display = "block";

  const grid = document.getElementById("todoGrid");
  grid.innerHTML = '';
  categories.forEach(cat => grid.appendChild(createTodoBox(cat)));

  await loadTasks(currentUserId);
  updateTaskCount();
  document.getElementById("taskForm").onsubmit = e => handleSubmit(e);
}

// 🔹 Firebase Session
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;
    initUserSession();
  } else {
    document.getElementById("taskForm").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
  }
});

// 🔹 UI: Restore textarea size only (optional, not data), after cache clear

document.addEventListener("DOMContentLoaded", function() {
  const textarea = document.getElementById('taskInput');
  // Restore from localStorage
  const savedWidth = localStorage.getItem('taskInputWidth');
  const savedHeight = localStorage.getItem('taskInputHeight');
  if (savedWidth) textarea.style.width = savedWidth;
  if (savedHeight) textarea.style.height = savedHeight;

  // Save current computed size on resize
  
  function saveTextareaSize() {
    const style = window.getComputedStyle(textarea);
    localStorage.setItem('taskInputWidth', style.width);
    localStorage.setItem('taskInputHeight', style.height);
  }
  // Listen for resize - "mouseup" works, but also consider "mouseleave" for best coverage
  
  textarea.addEventListener('mouseup', saveTextareaSize);
  textarea.addEventListener('mouseleave', saveTextareaSize);
  textarea.addEventListener('touchend', saveTextareaSize);

  // Optional: Listen for window unload to capture any last changes
  window.addEventListener('beforeunload', saveTextareaSize);
});


// 🔹 Periodic Sync (for real-time edits)
setInterval(updateTaskCount, 1000);
