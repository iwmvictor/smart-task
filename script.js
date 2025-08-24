// Elements
const taskListEl = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task-button");
const taskModal = document.getElementById("task-modal");
const taskDetailModal = document.getElementById("task-detail-modal");
const deleteModal = document.getElementById("delete-modal");
const taskForm = document.getElementById("task-form");
const modalCancelBtn = document.getElementById("modal-cancel");
const modalCloseBtn = document.getElementById("modal-close");
const detailModalCloseBtn = document.getElementById("detail-modal-close");
const tabs = document.querySelectorAll(".tab");
const themeToggleBtn = document.getElementById("theme-toggle");
const toastContainer = document.getElementById("toast-container");

// Clock elements
const clockDisplay = document.getElementById("clock-display");
const clockTime = document.getElementById("clock-time");

// Priority selector elements
const priorityBtns = document.querySelectorAll(".priority-btn");
const priorityInput = document.querySelector('input[name="priority"]');

// DateTime picker elements
const datePickerBtn = document.getElementById("date-picker-btn");
const timePickerBtn = document.getElementById("time-picker-btn");
const calendarDropdown = document.getElementById("calendar-dropdown");
const timeDropdown = document.getElementById("time-dropdown");
const selectedDateSpan = document.getElementById("selected-date");
const selectedTimeSpan = document.getElementById("selected-time");
const currentMonthSpan = document.getElementById("current-month");
const calendarGrid = document.getElementById("calendar-grid");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const hourSelect = document.getElementById("hour-select");
const minuteSelect = document.getElementById("minute-select");
const clearTimeBtn = document.getElementById("clear-time");
const setTimeBtn = document.getElementById("set-time");

// Delete modal elements
const deleteCancelBtn = document.getElementById("delete-cancel");
const deleteConfirmBtn = document.getElementById("delete-confirm");
const deleteTaskPreview = document.getElementById("delete-task-preview");

// Task detail elements
const detailEditBtn = document.getElementById("detail-edit-btn");
const detailDeleteBtn = document.getElementById("detail-delete-btn");

// Global state
let tasks = [];
let currentFilter = "all";
let isEditingTaskId = null;
let quillEditor = null;
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let taskToDelete = null;
let currentTaskDetail = null;

// Clock state
let clockInterval = null;

// Month names for calendar
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Initialize Rich Text Editor
function initializeEditor() {
  const editorContainer = document.getElementById("task-description-editor");

  quillEditor = new Quill(editorContainer, {
    theme: "snow",
    placeholder: "Enter task description...",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    },
  });

  // Update hidden input when editor content changes
  quillEditor.on("text-change", function () {
    const hiddenInput = taskForm.querySelector('input[name="description"]');
    const content = quillEditor.root.innerHTML;
    hiddenInput.value = content;

    // Validate content
    const textContent = quillEditor.getText().trim();
    if (textContent.length > 0) {
      hiddenInput.setCustomValidity("");
    } else {
      hiddenInput.setCustomValidity("Description is required");
    }
  });
}

// Initialize DateTime Pickers
function initializeDateTimePickers() {
  // Populate hour and minute selectors
  for (let i = 0; i < 24; i++) {
    const option = document.createElement("option");
    option.value = i.toString().padStart(2, "0");
    option.textContent = i.toString().padStart(2, "0");
    hourSelect.appendChild(option);
  }

  for (let i = 0; i < 60; i += 15) {
    const option = document.createElement("option");
    option.value = i.toString().padStart(2, "0");
    option.textContent = i.toString().padStart(2, "0");
    minuteSelect.appendChild(option);
  }

  // Set default time to current time
  const now = new Date();
  hourSelect.value = now.getHours().toString().padStart(2, "0");
  minuteSelect.value = Math.floor(now.getMinutes() / 15) * 15;

  updateCalendar();
}

// Calendar functions
function updateCalendar() {
  currentMonthSpan.textContent = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  calendarGrid.innerHTML = "";

  // Add day headers
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach((day) => {
    const header = document.createElement("div");
    header.textContent = day;
    header.style.fontWeight = "600";
    header.style.fontSize = "0.75rem";
    header.style.color = "var(--color-text-muted-light)";
    header.style.padding = "var(--spacing-sm)";
    header.style.textAlign = "center";
    calendarGrid.appendChild(header);
  });

  // Add calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = date.getDate();

    if (date.getMonth() !== currentDate.getMonth()) {
      dayEl.classList.add("other-month");
    }

    if (isToday(date)) {
      dayEl.classList.add("today");
    }

    if (selectedDate && isSameDay(date, selectedDate)) {
      dayEl.classList.add("selected");
    }

    dayEl.addEventListener("click", () => {
      selectedDate = new Date(date);
      selectedDateSpan.textContent = formatDate(selectedDate);
      updateCalendar();
      calendarDropdown.hidden = true;
      updateDeadlineInput();
    });

    calendarGrid.appendChild(dayEl);
  }
}

function isToday(date) {
  const today = new Date();
  return isSameDay(date, today);
}

function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(hours, minutes) {
  return `${hours}:${minutes}`;
}

function updateDeadlineInput() {
  const deadlineInput = document.querySelector('input[name="deadline"]');
  if (selectedDate && selectedTime) {
    const [hours, minutes] = selectedTime.split(":");
    const deadline = new Date(selectedDate);
    deadline.setHours(parseInt(hours), parseInt(minutes));
    deadlineInput.value = deadline.toISOString().slice(0, 16);
  } else if (selectedDate) {
    const deadline = new Date(selectedDate);
    deadline.setHours(23, 59);
    deadlineInput.value = deadline.toISOString().slice(0, 16);
  } else {
    deadlineInput.value = "";
  }
}

// Clock functions
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString(undefined, {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  clockTime.textContent = timeString;
}

function startClock() {
  updateClock(); // Update immediately
  clockInterval = setInterval(updateClock, 1000);
}

// Utils
function saveTasks() {
  localStorage.setItem("smartTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("smartTasks");
  if (data) {
    try {
      tasks = JSON.parse(data);
    } catch {
      tasks = [];
    }
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");

  toastContainer.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

function formatDeadline(dl) {
  if (!dl) return "";
  const dt = new Date(dl);
  if (isNaN(dt)) return "";

  const now = new Date();
  const diffTime = dt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let timeStr = dt.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });

  if (diffDays < 0) {
    timeStr += " (Overdue)";
  } else if (diffDays === 0) {
    timeStr += " (Today)";
  } else if (diffDays === 1) {
    timeStr += " (Tomorrow)";
  }

  return timeStr;
}

function stripHtmlTags(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function updateTabBadges() {
  const allCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  document.getElementById("badge-all").textContent = allCount;
  document.getElementById("badge-completed").textContent = completedCount;
  document.getElementById("badge-pending").textContent = pendingCount;
}

function getPriorityIcon(priority) {
  switch (priority) {
    case "high":
      return "fa-circle-exclamation";
    case "medium":
      return "fa-circle-minus";
    case "low":
      return "fa-circle-check";
    default:
      return "fa-circle-minus";
  }
}

function getPriorityText(priority) {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "Medium Priority";
  }
}

// Rendering
function renderTasks() {
  taskListEl.innerHTML = "";

  const filtered = tasks.filter((t) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "completed") return t.completed;
    if (currentFilter === "pending") return !t.completed;
    return true;
  });

  if (!filtered.length) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.innerHTML = `
      <i class="fa-solid fa-clipboard-list"></i>
      <h3>No tasks found</h3>
      <p>${
        currentFilter === "all"
          ? "Add your first task to get started!"
          : `No ${currentFilter} tasks yet.`
      }</p>
    `;
    taskListEl.appendChild(li);
    return;
  }

  // Sort tasks: incomplete first, then by priority, then by deadline
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    return 0;
  });

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-card";
    if (task.completed) li.classList.add("completed");

    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "article");

    const plainTextDesc = stripHtmlTags(task.description);
    li.setAttribute(
      "aria-label",
      `Task: ${task.title}, Priority: ${task.priority}, ` +
        `${task.completed ? "Completed" : "Pending"}${
          task.deadline ? ", Deadline: " + formatDeadline(task.deadline) : ""
        }`
    );

    const info = document.createElement("div");
    info.className = "task-info";

    const header = document.createElement("div");
    header.className = "task-header";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;
    header.appendChild(title);

    const priorityIndicator = document.createElement("div");
    priorityIndicator.className = `priority-indicator ${task.priority}`;
    priorityIndicator.innerHTML = `
      <i class="fa-solid ${getPriorityIcon(task.priority)}"></i>
      <span>${getPriorityText(task.priority)}</span>
    `;
    header.appendChild(priorityIndicator);

    info.appendChild(header);

    if (task.deadline) {
      const dd = document.createElement("div");
      dd.className = "task-deadline";
      dd.innerHTML = `<i class="fa-solid fa-calendar-days"></i>${formatDeadline(
        task.deadline
      )}`;
      info.appendChild(dd);
    }

    li.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.className = "complete-toggle";
    completeBtn.title = task.completed ? "Mark incomplete" : "Mark complete";
    completeBtn.setAttribute("aria-label", completeBtn.title);
    completeBtn.innerHTML = task.completed
      ? '<i class="fa-solid fa-check-circle"></i>'
      : '<i class="fa-regular fa-circle"></i>';
    completeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleComplete(task.id);
    });
    actions.appendChild(completeBtn);

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.title = "Edit task";
    editBtn.setAttribute("aria-label", "Edit task");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(task.id);
    });
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Delete task";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDeleteModal(task.id);
    });
    actions.appendChild(deleteBtn);

    li.appendChild(actions);

    // Make task card clickable to open detail modal
    li.addEventListener("click", () => {
      openTaskDetailModal(task.id);
    });

    taskListEl.appendChild(li);
  });

  updateTabBadges();
}

// Task operations
function addTask(task) {
  tasks.push(task);
  saveTasks();
  renderTasks();
  showToast("Task created successfully! 🎉", "success");
}

function updateTask(updated) {
  const idx = tasks.findIndex((t) => t.id === updated.id);
  if (idx !== -1) {
    tasks[idx] = updated;
    saveTasks();
    renderTasks();
    showToast("Task updated successfully", "success");
  }
}

function toggleComplete(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.completed = !t.completed;
    t.updatedAt = new Date().toISOString();
    saveTasks();
    renderTasks();
    showToast(
      t.completed ? "Task completed! 🎉" : "Task marked as incomplete",
      t.completed ? "success" : "info"
    );
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
  showToast("Task deleted", "info");
}

// Modal operations
function openAddModal() {
  isEditingTaskId = null;
  taskForm.reset();
  quillEditor.setContents([]);

  // Reset priority selection
  priorityBtns.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-checked", "false");
  });
  document.querySelector('[data-priority="medium"]').classList.add("active");
  document
    .querySelector('[data-priority="medium"]')
    .setAttribute("aria-checked", "true");
  priorityInput.value = "medium";

  // Reset date/time selection
  selectedDate = null;
  selectedTime = null;
  selectedDateSpan.textContent = "Select Date";
  selectedTimeSpan.textContent = "Set Time";

  const modalTitle = document.getElementById("modal-title");
  modalTitle.textContent = "Add New Task";

  const submitText = document.getElementById("submit-text");
  submitText.textContent = "Create Task";

  taskModal.hidden = false;
  taskModal.setAttribute("aria-hidden", "false");

  // Focus the title input
  setTimeout(() => {
    document.getElementById("task-title").focus();
  }, 100);
}

function openEditModal(id) {
  const t = tasks.find((t) => t.id === id);
  if (!t) return;

  isEditingTaskId = id;

  const modalTitle = document.getElementById("modal-title");
  modalTitle.textContent = "Edit Task";

  const submitText = document.getElementById("submit-text");
  submitText.textContent = "Update Task";

  // Set form values
  document.getElementById("task-title").value = t.title;

  // Set priority
  priorityBtns.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-checked", "false");
  });
  const priorityBtn = document.querySelector(`[data-priority="${t.priority}"]`);
  if (priorityBtn) {
    priorityBtn.classList.add("active");
    priorityBtn.setAttribute("aria-checked", "true");
  }
  priorityInput.value = t.priority;

  // Set deadline
  if (t.deadline) {
    const deadline = new Date(t.deadline);
    selectedDate = deadline;
    selectedTime = `${deadline
      .getHours()
      .toString()
      .padStart(2, "0")}:${deadline.getMinutes().toString().padStart(2, "0")}`;
    selectedDateSpan.textContent = formatDate(selectedDate);
    selectedTimeSpan.textContent = selectedTime;
    updateCalendar();
  } else {
    selectedDate = null;
    selectedTime = null;
    selectedDateSpan.textContent = "Select Date";
    selectedTimeSpan.textContent = "Set Time";
  }

  // Set editor content
  quillEditor.root.innerHTML = t.description;

  // Update hidden input
  const hiddenInput = taskForm.querySelector('input[name="description"]');
  hiddenInput.value = t.description;

  taskModal.hidden = false;
  taskModal.setAttribute("aria-hidden", "false");

  // Focus the title input
  setTimeout(() => {
    document.getElementById("task-title").focus();
  }, 100);
}

function closeModal() {
  taskModal.hidden = true;
  taskModal.setAttribute("aria-hidden", "true");
  isEditingTaskId = null;

  // Clear validation
  const hiddenInput = taskForm.querySelector('input[name="description"]');
  hiddenInput.setCustomValidity("");

  // Close dropdowns
  calendarDropdown.hidden = true;
  timeDropdown.hidden = true;
}

function openTaskDetailModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  currentTaskDetail = task;

  // Populate modal content
  document.getElementById("detail-task-title").textContent = task.title;

  const priorityEl = document.getElementById("detail-task-priority");
  priorityEl.className = `priority-indicator ${task.priority}`;
  priorityEl.innerHTML = `
    <i class="fa-solid ${getPriorityIcon(task.priority)}"></i>
    <span>${getPriorityText(task.priority)}</span>
  `;

  if (task.deadline) {
    document.getElementById("detail-deadline-container").style.display = "flex";
    document.getElementById("detail-deadline").textContent = formatDeadline(
      task.deadline
    );
  } else {
    document.getElementById("detail-deadline-container").style.display = "none";
  }

  document.getElementById("detail-created-date").textContent = new Date(
    task.createdAt
  ).toLocaleDateString();
  document.getElementById("detail-description-content").innerHTML =
    task.description;

  taskDetailModal.hidden = false;
  taskDetailModal.setAttribute("aria-hidden", "false");
}

function closeTaskDetailModal() {
  taskDetailModal.hidden = true;
  taskDetailModal.setAttribute("aria-hidden", "true");
  currentTaskDetail = null;
}

function openDeleteModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  taskToDelete = task;
  deleteTaskPreview.textContent = task.title;

  deleteModal.hidden = false;
  deleteModal.setAttribute("aria-hidden", "false");

  // Focus the cancel button for safety
  setTimeout(() => {
    deleteCancelBtn.focus();
  }, 100);
}

function closeDeleteModal() {
  deleteModal.hidden = true;
  deleteModal.setAttribute("aria-hidden", "true");
  taskToDelete = null;
}

// Timer functions
function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;

  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  timerTime.textContent = timeString;

  if (timerHours) {
    timerHours.textContent = hours.toString().padStart(2, "0");
    timerMinutes.textContent = minutes.toString().padStart(2, "0");
    timerSecondsDisplay.textContent = seconds.toString().padStart(2, "0");
  }
}

function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    timerStartTime = Date.now() - timerPausedTime * 1000;

    timerInterval = setInterval(() => {
      timerSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
      updateTimerDisplay();
    }, 1000);

    timerDisplay.classList.add("active");
    timerToggleBtn.classList.add("active");
    timerToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    timerToggleBtn.title = "Pause Timer";

    timerStartBtn.disabled = true;
    timerPauseBtn.disabled = false;

    showToast("Timer started", "success");
  }
}

function pauseTimer() {
  if (isTimerRunning) {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerPausedTime = timerSeconds;

    timerDisplay.classList.remove("active");
    timerToggleBtn.classList.remove("active");
    timerToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    timerToggleBtn.title = "Start Timer";

    timerStartBtn.disabled = false;
    timerPauseBtn.disabled = true;

    showToast("Timer paused", "info");
  }
}

function resetTimer() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  timerSeconds = 0;
  timerPausedTime = 0;
  timerStartTime = null;

  updateTimerDisplay();

  timerDisplay.classList.remove("active");
  timerToggleBtn.classList.remove("active");
  timerToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  timerToggleBtn.title = "Start Timer";

  timerStartBtn.disabled = false;
  timerPauseBtn.disabled = true;

  showToast("Timer reset", "info");
}

// Event handlers
addTaskBtn.addEventListener("click", openAddModal);
modalCancelBtn.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);
detailModalCloseBtn.addEventListener("click", closeTaskDetailModal);

// Modal backdrop clicks
taskModal.addEventListener("click", (e) => {
  if (e.target === taskModal) closeModal();
});

taskDetailModal.addEventListener("click", (e) => {
  if (e.target === taskDetailModal) closeTaskDetailModal();
});

deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

// Priority selector
priorityBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    priorityBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-checked", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-checked", "true");
    priorityInput.value = btn.dataset.priority;
  });
});

// DateTime picker events
datePickerBtn.addEventListener("click", () => {
  calendarDropdown.hidden = !calendarDropdown.hidden;
  timeDropdown.hidden = true;
  if (!calendarDropdown.hidden) {
    updateCalendar();
  }
});

timePickerBtn.addEventListener("click", () => {
  timeDropdown.hidden = !timeDropdown.hidden;
  calendarDropdown.hidden = true;
});

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

clearTimeBtn.addEventListener("click", () => {
  selectedTime = null;
  selectedTimeSpan.textContent = "Set Time";
  timeDropdown.hidden = true;
  updateDeadlineInput();
});

setTimeBtn.addEventListener("click", () => {
  const hours = hourSelect.value;
  const minutes = minuteSelect.value;
  selectedTime = formatTime(hours, minutes);
  selectedTimeSpan.textContent = selectedTime;
  timeDropdown.hidden = true;
  updateDeadlineInput();
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (
    !datePickerBtn.contains(e.target) &&
    !calendarDropdown.contains(e.target)
  ) {
    calendarDropdown.hidden = true;
  }
  if (!timePickerBtn.contains(e.target) && !timeDropdown.contains(e.target)) {
    timeDropdown.hidden = true;
  }
});

// Delete modal events
deleteCancelBtn.addEventListener("click", closeDeleteModal);
deleteConfirmBtn.addEventListener("click", () => {
  if (taskToDelete) {
    deleteTask(taskToDelete.id);
    closeDeleteModal();
  }
});

// Task detail modal events
detailEditBtn.addEventListener("click", () => {
  if (currentTaskDetail) {
    closeTaskDetailModal();
    openEditModal(currentTaskDetail.id);
  }
});

detailDeleteBtn.addEventListener("click", () => {
  if (currentTaskDetail) {
    closeTaskDetailModal();
    openDeleteModal(currentTaskDetail.id);
  }
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(taskForm);
  const title = data.get("title").trim();
  const description = data.get("description").trim();
  const textContent = quillEditor.getText().trim();

  if (!title) {
    showToast("Please enter a task title", "error");
    document.getElementById("task-title").focus();
    return;
  }

  if (!textContent) {
    showToast("Please enter a task description", "error");
    quillEditor.focus();
    return;
  }

  const newTask = {
    id: isEditingTaskId || Date.now().toString(),
    title: title,
    description: description,
    priority: data.get("priority"),
    deadline: data.get("deadline") || null,
    completed: false,
    createdAt: isEditingTaskId
      ? tasks.find((t) => t.id === isEditingTaskId)?.createdAt
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isEditingTaskId) {
    const existing = tasks.find((t) => t.id === isEditingTaskId);
    if (existing) {
      newTask.completed = existing.completed;
      newTask.createdAt = existing.createdAt;
    }
    updateTask(newTask);
  } else {
    addTask(newTask);
  }

  closeModal();
});

// Tab functionality with improved accessibility
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTab(tab.dataset.filter);
  });

  tab.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tab.dataset.filter);
    }
  });
});

function setActiveTab(filter) {
  currentFilter = filter;

  tabs.forEach((t) => {
    const isActive = t.dataset.filter === filter;
    t.classList.toggle("active", isActive);
    t.setAttribute("aria-selected", isActive);
  });

  renderTasks();
}

// Enhanced Theme Toggle
function loadTheme() {
  const savedTheme = localStorage.getItem("smarttask-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");

  applyTheme(theme);
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark", isDark);

  // Update button icon with smooth transition
  const icon = themeToggleBtn.querySelector("i");
  icon.style.transform = "rotate(180deg)";

  setTimeout(() => {
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    icon.style.transform = "rotate(0deg)";
  }, 150);

  // Update button title
  themeToggleBtn.title = isDark
    ? "Switch to light mode"
    : "Switch to dark mode";
  themeToggleBtn.setAttribute("aria-label", themeToggleBtn.title);

  localStorage.setItem("smarttask-theme", theme);
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark")
    ? "dark"
    : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
});

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("smarttask-theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

// Enhanced keyboard accessibility
document.addEventListener("keydown", (e) => {
  // Close modals with Escape
  if (e.key === "Escape") {
    if (!taskModal.hidden) {
      closeModal();
      return;
    }
    if (!taskDetailModal.hidden) {
      closeTaskDetailModal();
      return;
    }
    if (!deleteModal.hidden) {
      closeDeleteModal();
      return;
    }
    if (!calendarDropdown.hidden) {
      calendarDropdown.hidden = true;
      return;
    }
    if (!timeDropdown.hidden) {
      timeDropdown.hidden = true;
      return;
    }
  }

  // Quick add task with Ctrl/Cmd + N
  if ((e.ctrlKey || e.metaKey) && e.key === "n" && taskModal.hidden) {
    e.preventDefault();
    openAddModal();
    return;
  }

  // Tab navigation
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const activeTab = document.querySelector(".tab.active");
    if (
      document.activeElement === activeTab ||
      tabs.includes(document.activeElement)
    ) {
      e.preventDefault();
      const currentIndex = Array.from(tabs).indexOf(
        document.activeElement === activeTab
          ? activeTab
          : document.activeElement
      );
      let nextIndex;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }

      tabs[nextIndex].focus();
    }
  }
});

// Initialize application
function initApp() {
  loadTasks();
  loadTheme();
  initializeEditor();
  initializeDateTimePickers();
  startClock();
  renderTasks();

  // Set initial ARIA states
  tabs.forEach((tab) => {
    tab.setAttribute("aria-selected", tab.classList.contains("active"));
  });

  // Announce app ready to screen readers
  setTimeout(() => {
    const taskCount = tasks.length;
    const message =
      taskCount === 0
        ? "Task manager ready. No tasks yet."
        : `Task manager ready. ${taskCount} task${
            taskCount === 1 ? "" : "s"
          } loaded.`;

    // Create a live region announcement
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.style.position = "absolute";
    announcement.style.left = "-10000px";
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  }, 500);
}

// Start the application
initApp();
