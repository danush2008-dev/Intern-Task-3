/* =========================================
   TaskFlow — Vanilla JavaScript
   Source of truth: tasks + currentFilter
   Flow: action -> state -> save -> render
   ========================================= */

"use strict";

const STORAGE_KEY = "taskflow-tasks";
const THEME_KEY = "taskflow-theme";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyState = document.getElementById("empty-state");
const emptyTitle = document.getElementById("empty-title");
const emptyDescription = document.getElementById("empty-description");
const formMessage = document.getElementById("form-message");
const clearCompletedButton = document.getElementById("clear-completed");
const filtersContainer = document.querySelector(".filters");
const themeToggle = document.getElementById("theme-toggle");

let tasks = [];
let currentFilter = "all";

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
    try {
        const savedTasks = window.localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            tasks = [];
            return;
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            tasks = [];
            return;
        }

        tasks = parsedTasks.filter((task) => (
            task &&
            (typeof task.id === "string" || typeof task.id === "number") &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        ));
    } catch (error) {
        tasks = [];
        console.warn("Saved task data could not be loaded.", error);
    }
}

function saveTasks() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        showMessage("Tasks could not be saved in this browser.", false);
        console.warn("localStorage could not be updated.", error);
    }
}

function getVisibleTasks() {
    if (currentFilter === "active") {
        return tasks.filter((task) => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter((task) => task.completed);
    }

    return tasks;
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = getVisibleTasks();

    visibleTasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("is-completed");
        }

        taskItem.dataset.id = String(task.id);

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.className = "complete-button";
        completeButton.dataset.action = "toggle";
        completeButton.setAttribute(
            "aria-label",
            task.completed ? "Mark task active" : "Mark task completed"
        );
        completeButton.setAttribute("aria-pressed", String(task.completed));

        const checkmark = document.createElement("span");
        checkmark.className = "checkmark";
        checkmark.setAttribute("aria-hidden", "true");
        checkmark.textContent = "✓";
        completeButton.append(checkmark);

        const content = document.createElement("div");
        content.className = "task-content";

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;
        content.append(taskText);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "icon-button";
        editButton.dataset.action = "edit";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit task: ${task.text}`);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "icon-button delete-button";
        deleteButton.dataset.action = "delete";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);

        actions.append(editButton, deleteButton);
        taskItem.append(completeButton, content, actions);
        taskList.append(taskItem);
    });

    updateTaskCount();
    updateEmptyState(visibleTasks.length === 0);
}

function updateTaskCount() {
    const activeCount = tasks.filter((task) => !task.completed).length;
    taskCount.textContent = activeCount === 1
        ? "1 task left"
        : `${activeCount} tasks left`;
}

function updateEmptyState(isEmpty) {
    emptyState.hidden = !isEmpty;

    if (!isEmpty) {
        return;
    }

    if (tasks.length === 0) {
        emptyTitle.textContent = "No tasks yet";
        emptyDescription.textContent = "Add your first task above and start making progress.";
        return;
    }

    if (currentFilter === "active") {
        emptyTitle.textContent = "No active tasks";
        emptyDescription.textContent = "Everything is completed. Nice work!";
        return;
    }

    emptyTitle.textContent = "No completed tasks";
    emptyDescription.textContent = "Completed tasks will appear here.";
}

function addTask(text) {
    const cleanText = text.trim();

    if (!cleanText) {
        showMessage("Please enter a task before adding it.", false);
        taskInput.focus();
        return;
    }

    tasks.push({
        id: createId(),
        text: cleanText,
        completed: false
    });

    saveTasks();
    currentFilter = "all";
    updateFilterButtons();
    renderTasks();

    taskInput.value = "";
    showMessage("Task added.", true);
    taskInput.focus();
}

function updateTask(id, changes) {
    const task = tasks.find((item) => String(item.id) === String(id));

    if (!task) {
        return;
    }

    Object.assign(task, changes);
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    const originalLength = tasks.length;

    tasks = tasks.filter((task) => String(task.id) !== String(id));

    if (tasks.length === originalLength) {
        return;
    }

    saveTasks();
    renderTasks();
    showMessage("Task deleted.", true);
}

function editTask(taskItem, task) {
    const content = taskItem.querySelector(".task-content");
    const actions = taskItem.querySelector(".task-actions");

    const editForm = document.createElement("form");
    editForm.className = "edit-form";
    editForm.setAttribute("aria-label", "Edit task");

    const editInput = document.createElement("input");
    editInput.className = "edit-input";
    editInput.type = "text";
    editInput.maxLength = 120;
    editInput.value = task.text;
    editInput.setAttribute("aria-label", "Task text");

    const saveButton = document.createElement("button");
    saveButton.className = "icon-button";
    saveButton.type = "submit";
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.className = "icon-button";
    cancelButton.type = "button";
    cancelButton.dataset.action = "cancel-edit";
    cancelButton.textContent = "Cancel";

    editForm.append(editInput, saveButton, cancelButton);
    content.replaceChildren(editForm);
    actions.hidden = true;

    editInput.focus();
    editInput.select();
}

function showMessage(message, isSuccess) {
    formMessage.textContent = message;
    formMessage.classList.toggle("is-success", isSuccess);

    window.clearTimeout(showMessage.timeoutId);

    showMessage.timeoutId = window.setTimeout(() => {
        formMessage.textContent = "";
        formMessage.classList.remove("is-success");
    }, 2500);
}

function updateFilterButtons() {
    const filterButtons = filtersContainer.querySelectorAll("[data-filter]");

    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === currentFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function setFilter(filter) {
    if (!["all", "active", "completed"].includes(filter)) {
        return;
    }

    currentFilter = filter;
    updateFilterButtons();
    renderTasks();
}

function clearCompleted() {
    const completedCount = tasks.filter((task) => task.completed).length;

    if (completedCount === 0) {
        showMessage("There are no completed tasks to clear.", false);
        return;
    }

    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
    showMessage(
        `${completedCount} completed ${completedCount === 1 ? "task" : "tasks"} cleared.`,
        true
    );
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const isDark = theme === "dark";

    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    const icon = themeToggle.querySelector("[aria-hidden='true']");

    if (icon) {
        icon.textContent = isDark ? "☀" : "☾";
    }

    const label = themeToggle.querySelector(".theme-label");

    if (label) {
        label.textContent = isDark ? "Light mode" : "Dark mode";
    }

    try {
        window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.warn("Theme preference could not be saved.", error);
    }
}

function loadTheme() {
    let savedTheme = null;

    try {
        savedTheme = window.localStorage.getItem(THEME_KEY);
    } catch (error) {
        savedTheme = null;
    }

    if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(prefersDark ? "dark" : "light");
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(taskInput.value);
});

filtersContainer.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-filter]");

    if (!filterButton) {
        return;
    }

    setFilter(filterButton.dataset.filter);
});

clearCompletedButton.addEventListener("click", clearCompleted);

/* Event delegation: one listener handles all current and future task controls. */
taskList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    const taskItem = event.target.closest(".task-item");

    if (!actionButton || !taskItem) {
        return;
    }

    const task = tasks.find((item) => String(item.id) === taskItem.dataset.id);

    if (!task) {
        return;
    }

    const action = actionButton.dataset.action;

    if (action === "toggle") {
        updateTask(task.id, { completed: !task.completed });
    }

    if (action === "delete") {
        deleteTask(task.id);
    }

    if (action === "edit") {
        editTask(taskItem, task);
    }

    if (action === "cancel-edit") {
        renderTasks();
    }
});

taskList.addEventListener("submit", (event) => {
    const editForm = event.target.closest(".edit-form");

    if (!editForm) {
        return;
    }

    event.preventDefault();

    const taskItem = editForm.closest(".task-item");
    const editInput = editForm.querySelector(".edit-input");

    if (!taskItem || !editInput) {
        return;
    }

    const newText = editInput.value.trim();

    if (!newText) {
        editInput.setAttribute("aria-invalid", "true");
        editInput.focus();
        return;
    }

    updateTask(taskItem.dataset.id, { text: newText });
    showMessage("Task updated.", true);
});

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme || "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
});

loadTheme();
loadTasks();
updateFilterButtons();
renderTasks();
