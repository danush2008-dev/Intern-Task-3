# JavaScript To-Do List — State Management & DOM Manipulation

## Objective
This third web-development project demonstrates DOM manipulation, event handling, CRUD operations, state management, localStorage, filtering, and event delegation using a client-side Vanilla JavaScript application.

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript

## Features
- Add tasks with the button or Enter key
- Reject empty/whitespace-only tasks
- Mark tasks active/completed
- Edit task text
- Delete tasks
- All / Active / Completed filters
- Clear completed tasks
- localStorage persistence and state restoration
- Dynamic rendering from JavaScript state
- Event delegation for dynamic task controls
- Responsive mobile/tablet/desktop design
- Light/dark theme with persisted preference
- Semantic HTML, keyboard access, focus states and accessible labels
- Empty-state and live status feedback

## How to Run
1. Extract the project folder.
2. Open `index.html` directly in a modern browser.
3. Add and manage tasks.

No build process, installation, backend, database, or external dependency is required.

## JavaScript Concepts Demonstrated
- **DOM manipulation:** `createElement()`, `append()`, `replaceChildren()`, `classList`, and `textContent` build the task UI dynamically.
- **Event delegation:** one task-list listener uses `event.target.closest()` to handle controls created later.
- **State management:** `tasks` and `currentFilter` are the source of truth; the DOM reflects state.
- **localStorage:** `JSON.stringify()` saves the task array and `JSON.parse()` restores it.
- **CRUD:** Create, Read, Update and Delete task operations are implemented.
- **Filtering:** All, Active and Completed views are derived from the current state.

## Application Flow
```text
User Action → Update JavaScript State → Save State → Render UI
```
