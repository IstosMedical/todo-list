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

const milestoneTitles = [
  { threshold: 30, title: "Overachiever" },
  { threshold: 20, title: "Champion" },
  { threshold: 10, title: "Brilliant" }
  // You can add more titles and thresholds if you want
];

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

    // --- Milestone Title Logic ---
    const boxTitle = box.querySelector('.box-title');
    if (!boxTitle) return;

    // Remove previous badge if you don't want that feature
    let badge = boxTitle.querySelector('.badge-medal');
    if (badge) badge.remove();

    // Remove previous playful title if any
    let titleSpan = boxTitle.querySelector('.playful-title');
    if (titleSpan) titleSpan.remove();

    // Find the highest title for this count
    let playfulTitle = "";
    let milestoneKey = ""; // for toast logic
    for (let i = 0; i < milestoneTitles.length; i++) {
      if (taskCount >= milestoneTitles[i].threshold) {
        playfulTitle = milestoneTitles[i].title;
        milestoneKey = milestoneTitles[i].threshold + '';
        break;
      }
    }

    // If milestone is hit, display playful title
    if (playfulTitle) {
      titleSpan = document.createElement('span');
      titleSpan.className = 'playful-title';
      titleSpan.textContent = ` • ${playfulTitle}`;
      titleSpan.style.fontWeight = "bold";
      titleSpan.style.color = "#6A1B9A"; // accent color
      titleSpan.style.fontSize = "1rem";
      titleSpan.style.marginLeft = "8px";
      boxTitle.appendChild(titleSpan);

      // Show toast only first time after reaching this milestone threshold
      if (boxTitle.getAttribute('data-milestone') !== milestoneKey) {
        showToast(playfulTitle);
        boxTitle.setAttribute('data-milestone', milestoneKey);
      }
    } else {
      // No milestone title, clear marker
      boxTitle.removeAttribute('data-milestone');
    }
  });
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
