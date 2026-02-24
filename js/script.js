// ==================== DOM Element References ====================
// Modal and team setup elements
const modal = document.querySelector("dialog");
const startBtn = document.querySelector("#startButton");
const teamNameInput = document.querySelector("#teamInput");
const teamList = document.querySelector("#teamMembers");
const tasksBoardCount = document.querySelector("#tasks-board-count");

// Task input and control elements
const inputTask = document.querySelector("#taskInput");
const addTaskBtn = document.querySelector("#addTaskButton");
const tasksPlaceHolder = document.querySelector("#no-tasks");
const tasksBoard = document.querySelector("#tasksBoard");
const tasks = document.querySelectorAll(".task-item");

// Error and validation elements
const namesErrorP = document.querySelector("#names-error");

// ==================== Application State ====================
// Array to store all team member names
let teamNames = [];

// ==================== Page Initialization ====================
// Show team setup modal when the page loads
window.onload = () => {
  modal.style.display = "flex";
  modal.showModal();
};

// ==================== Team Setup Handler ====================
// Handle team member creation when start button is clicked
startBtn.addEventListener("click", () => {
  // Validation: Check if input is empty
  if (teamNameInput.value.trim() === "") {
    namesErrorP.textContent = "Please enter at least one team name.";
    namesErrorP.classList.remove("hidden");
    namesErrorP.classList.add("error");
    return;
  } else if (teamNameInput.value.trim().length < 3) {
    // Validation: Ensure minimum name length
    namesErrorP.textContent = "Team names must be at least 3 characters long.";
    namesErrorP.classList.remove("hidden");
    namesErrorP.classList.add("error");
    return;
  }

  // Clear any previous error messages
  namesErrorP.classList.remove("error");
  namesErrorP.classList.add("hidden");
  namesErrorP.textContent = "";

  // Process team names: split by comma, trim whitespace, capitalize first letter, and filter empty strings
  teamNames = teamNameInput.value
    .trim()
    .split(",")
    .map((name) => name.trim()[0].toUpperCase() + name.trim().slice(1))
    .filter((name) => name.length > 0);

  // Display team members and close the modal
  displayTeams();
  modal.close();
  modal.style.display = "none";
});

// ==================== Add Task Handler ====================
// Handle new task creation when add task button is clicked
addTaskBtn.addEventListener("click", () => {
  let taskText = inputTask.value.trim();

  // Validation: Check if task is empty
  if (taskText === "") {
    tasksPlaceHolder.classList.add("error");
    tasksPlaceHolder.textContent = "Task cannot be empty!";
    return;
  } else if (taskText.length < 5) {
    // Validation: Ensure minimum task text length
    tasksPlaceHolder.classList.add("error");
    tasksPlaceHolder.textContent = "Task must be at least 5 characters long!";
    return;
  }

  // Clear error state and hide placeholder
  tasksPlaceHolder.classList.remove("error");
  tasksPlaceHolder.classList.add("hidden");

  // Create main task container with unique ID based on timestamp
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task-item");
  taskDiv.id = "task-" + Date.now();

  // Create task text element
  const taskTextSpan = document.createElement("span");
  taskTextSpan.textContent = taskText;
  inputTask.value = "";

  // Create delete button for the task
  const deleteBtn = document.createElement("span");
  deleteBtn.textContent = "🗑️";
  deleteBtn.classList.add("delete-task-btn");

  // Delete button event: remove task and update all counts
  deleteBtn.addEventListener("click", () => {
    taskDiv.remove();
    loopForUpdateCountOfTasksForEachTeamMember();
    updateTaskCount(tasksBoardCount, ".task-item");
    // Show placeholder if no tasks remain
    if (document.querySelectorAll(".task-item").length === 0) {
      tasksPlaceHolder.classList.remove("hidden");
    }
  });

  // Build task structure: body contains text and delete button
  const taskBody = document.createElement("div");
  taskBody.classList.add("task-body");
  taskBody.appendChild(taskTextSpan);
  taskBody.appendChild(deleteBtn);
  taskDiv.appendChild(taskBody);

  // Make task draggable and add to board
  taskDiv.draggable = true;
  tasksBoard.appendChild(taskDiv);

  // Update task count and enable drag functionality
  updateTaskCount(tasksBoardCount, ".task-item");
  makeTasksDraggable();
});

// ==================== Drag and Drop Functionality ====================
// Enable drag functionality for all task items
function makeTasksDraggable() {
  const tasks = document.querySelectorAll(".task-item");
  tasks.forEach((task) => {
    // Dragstart: Store dragged task ID and add visual feedback
    task.addEventListener("dragstart", (e) => {
      task.parentElement.classList.add("dragging-board");
      e.dataTransfer.setData("myId", e.target.id);

      // Update all team member task counts when drag starts
      const teamCards = document.querySelectorAll(".team-card");
      teamCards.forEach((card) => {
        const countSpan = card.querySelector(".team-head .member-tasks-count");
        updateTaskCount(countSpan, `#${card.id} .task-item`);
      });
    });

    // Drag: Add visual effect while dragging
    task.addEventListener("drag", (e) => {
      e.preventDefault();
      e.target.classList.add("dragging");
    });

    // Dragend: Clean up visual effects when drag operation ends
    task.addEventListener("dragend", (e) => {
      e.preventDefault();
      task.parentElement.classList.remove("dragging-board");
      e.target.classList.remove("dragging");
    });
  });
}

// Allow tasks board to accept dropped items
tasksBoard.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// ==================== Utility Functions ====================
// Update and display the count of tasks in a specific container
function updateTaskCount(count, itemsClass) {
  count.textContent = document.querySelectorAll(itemsClass).length;
  return document.querySelectorAll(itemsClass).length;
}

// ==================== Team Display Functions ====================
// Create and display team member cards in the UI
function displayTeams() {
  teamList.innerHTML = "";

  teamNames.forEach((team, index) => {
    // Create team card container with unique ID
    const div = document.createElement("div");
    div.classList.add("team-card");
    div.id = "team-" + index;

    // Create placeholder for when team has no tasks
    const tasksPlaceHolder = document.createElement("span");
    tasksPlaceHolder.textContent = "No tasks assigned yet!";
    tasksPlaceHolder.classList.add("no-data");

    // Create container for team's tasks
    const tasks = document.createElement("div");
    tasks.classList.add("team-tasks");

    // Create team header with name and task count
    const head = document.createElement("div");
    head.classList.add("team-head");
    const title = document.createElement("span");
    const count = document.createElement("span");
    count.classList.add("member-tasks-count");
    count.id = "member-tasks-count-" + index;
    count.textContent = "0";
    title.textContent = `🙍‍♂️ ${team}`;

    // Assemble the team card structure
    head.appendChild(title);
    head.appendChild(count);
    div.appendChild(head);
    tasks.appendChild(tasksPlaceHolder);
    div.appendChild(tasks);
    teamList.appendChild(div);
  });

  // Enable drag-and-drop functionality for team cards
  allowDropOnTeams();
}
// Enable team cards to accept dropped tasks
function allowDropOnTeams() {
  const teamCards = document.querySelectorAll(".team-card");

  teamCards.forEach((card) => {
    // Dragover: Highlight the drop zone when task is dragged over
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      tasksBoard.classList.remove("dragging-board");
      card.querySelector(".team-tasks").classList.add("dragging-board");
    });

    // Dragleave: Remove highlight when task leaves the drop zone
    card.addEventListener("dragleave", (e) => {
      e.preventDefault();
      card.querySelector(".team-tasks").classList.remove("dragging-board");
    });

    // Drop: Handle task assignment to team member
    card.addEventListener("drop", (e) => {
      e.preventDefault();

      // Retrieve the dragged task element
      const draggedId = e.dataTransfer.getData("myId");
      const draggedTask = document.querySelector(`#${draggedId}`);
      const cardTasks = card.querySelector(".team-tasks");

      // Add status dropdown to the task if not already present
      updateTaskUIAddStatus(draggedTask);

      // Move task to team member's task list
      cardTasks.appendChild(draggedTask);
      cardTasks.classList.remove("dragging-board");

      // Update task counts for all team members and main board
      loopForUpdateCountOfTasksForEachTeamMember();
      let count = updateTaskCount(tasksBoardCount, ".tasks-board .task-item");

      // Show placeholder if main board is empty
      if (count === 0) {
        tasksPlaceHolder.classList.remove("hidden");
      }
    });
  });
}

// ==================== Task Count Management ====================
// Update task count for each team member and manage placeholder visibility
function loopForUpdateCountOfTasksForEachTeamMember() {
  const teamCards = document.querySelectorAll(".team-card");

  teamCards.forEach((card) => {
    // Get and update the task count display for this team member
    const countSpan = card.querySelector(".team-head .member-tasks-count");
    let count = updateTaskCount(countSpan, `#${card.id} .task-item`);

    const placeholder = card.querySelector(".no-data");

    // Show/hide placeholder based on whether team has tasks
    if (count === 0) {
      placeholder.classList.remove("hidden");
    } else {
      placeholder.classList.add("hidden");
    }
  });
}

// ==================== Task Status Management ====================
// Add status dropdown to task when assigned to a team member
function updateTaskUIAddStatus(taskElement) {
  // Prevent adding multiple status dropdowns to the same task
  if (taskElement.classList.contains("has-task-status")) {
    return;
  }

  // Create status dropdown with all available options
  const statusSelect = document.createElement("select");
  const statuses = ["Not Started", "Ongoing", "Finished"];

  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;

    // Set "Not Started" as default and apply initial styling
    if (status === "Not Started") {
      option.selected = true;
      taskElement.classList.add("not-started");
    }
    statusSelect.appendChild(option);
  });

  // Mark task as having status to prevent duplicates
  taskElement.classList.add("has-task-status");

  // Handle status changes: update CSS classes for visual feedback
  statusSelect.addEventListener("change", (e) => {
    const selectedStatus = e.target.value;

    switch (selectedStatus) {
      case "Not Started":
        taskElement.classList.remove("ongoing", "finished");
        taskElement.classList.add("not-started");
        break;
      case "Ongoing":
        taskElement.classList.remove("not-started", "finished");
        taskElement.classList.add("ongoing");
        break;
      case "Finished":
        taskElement.classList.remove("not-started", "ongoing");
        taskElement.classList.add("finished");
        break;
    }
  });

  // Add the status dropdown to the task element
  taskElement.appendChild(statusSelect);
}
