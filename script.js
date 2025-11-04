<script>
const categoryBoxes = [
  'Get-Payments', 'service', 'Leads',
  'do-Payments', 'Office', 'Personal'
];

// Load tasks from localStorage on page load
window.onload = () => {
  const savedTasks = JSON.parse(localStorage.getItem("istosTasks") || "[]");
  savedTasks.forEach(({ text, category }) => {
    const container = document.querySelector(`#${category}Box .tasks`);
    const taskElement = createTaskElement(text, category);
    container.appendChild(taskElement);
  });
};

function addTask() {
  const taskText = getTaskInput();
  if (!taskText) return;

  const assignedBox = getSelectedCategory();
  const tasksContainer = document.querySelector(`#${assignedBox}Box .tasks`);
  const taskElement = createTaskElement(taskText, assignedBox);

  tasksContainer.appendChild(taskElement);
  saveTask(taskText, assignedBox);
  clearTaskInput();
  clearCategorySelection();
}

function getTaskInput() {
  return document.getElementById('taskInput').value.trim();
}

function clearTaskInput() {
  document.getElementById('taskInput').value = '';
}

function getSelectedCategory() {
  for (const box of categoryBoxes) {
    if (document.getElementById(`${box}Checkbox`).checked) {
      return box;
    }
  }
  return document.getElementById('OthersCheckbox').checked ? 'others' : 'others';
}

function clearCategorySelection() {
  categoryBoxes.forEach(box => {
    document.getElementById(`${box}Checkbox`).checked = false;
  });
  document.getElementById('OthersCheckbox').checked = false;
}

function createTaskElement(text, category) {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'task-item';

  const taskContent = document.createElement('span');
  taskContent.textContent = text;

  const removeBtn = document.createElement('span');
  removeBtn.textContent = '✕';
  removeBtn.className = 'remove-btn';
  removeBtn.title = 'Remove task';
  removeBtn.style.cursor = 'pointer';
  removeBtn.style.marginLeft = '12px';
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
</script>
