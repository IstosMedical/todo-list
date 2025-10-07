function addTask() {
    const taskText = document.getElementById('taskInput').value;
    let assignedBox = 'others'; // default

    // List of box ids matching checkboxes and boxes
    const boxes = ['urgent', 'priority', 'service', 'orders', 'payments', 'office', 'reminder'];
    let found = false;

    for (const box of boxes) {
        if (document.getElementById(`${box}Checkbox`).checked) {
            assignedBox = box;
            found = true;
            break;
        }
    }

    // If none checked, stays as 'others'
    // Now append the new task to that box's div
    const taskDiv = document.createElement('div');
    taskDiv.textContent = taskText;
    document.getElementById(`${assignedBox}Box`).appendChild(taskDiv);
}
