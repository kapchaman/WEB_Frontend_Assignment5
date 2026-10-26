"use strict";

// TASK 2 / OPTION A: the array is the single source of truth, not the HTML.
const ACTIVE_LIMIT = 3;
const COLUMNS = [
  { id: "todo", title: "To do" },
  { id: "active", title: "In progress" },
  { id: "done", title: "Done" }
];
const PRIORITY_NAMES = { 1: "HIGH", 2: "MEDIUM", 3: "LOW" };
// Unique id; strings, numbers and a boolean in every object.
const tasks = [
  { id: "scope", title: "Give the telescope a test run", description: "Focus on a distant landmark before the sky goes dark.", tag: "Astronomy", priority: 1, minutes: 20, outdoor: true, status: "active" },
  { id: "moon", title: "Map a route across the Moon", description: "Choose three lunar features for the first observation.", tag: "Astronomy", priority: 2, minutes: 15, outdoor: true, status: "todo" },
  { id: "rubin", title: "Prepare the Vera Rubin story", description: "Explain the puzzle behind galaxy rotation curves.", tag: "Science", priority: 1, minutes: 30, outdoor: false, status: "active" },
  { id: "survival", title: "Print the Moon survival challenge", description: "One landing, a missing crew and a very debatable packing list.", tag: "Community", priority: 2, minutes: 10, outdoor: false, status: "todo" },
  { id: "guitar", title: "Tune the guitar for the last set", description: "Keep an acoustic song ready for the walk back from the stars.", tag: "Music", priority: 3, minutes: 10, outdoor: false, status: "todo" },
  { id: "dombra", title: "Bring the dombra", description: "Leave a little room for the sound of the steppe.", tag: "Music", priority: 3, minutes: 5, outdoor: false, status: "todo" },
  { id: "weather", title: "Make a cloudy-sky backup plan", description: "An indoor constellation session if Astana has other ideas.", tag: "Logistics", priority: 1, minutes: 15, outdoor: false, status: "todo" },
  { id: "crew", title: "Welcome the new Astro Club crew", description: "Pair each first-time observer with a familiar face.", tag: "Community", priority: 2, minutes: 10, outdoor: false, status: "done" },
  { id: "light", title: "Check the observing spot", description: "Find a safe place with fewer lamps and a clear horizon.", tag: "Logistics", priority: 1, minutes: 20, outdoor: true, status: "active" },
  { id: "lens", title: "Pack the lenses and red light", description: "A final equipment check before leaving campus.", tag: "Astronomy", priority: 1, minutes: 10, outdoor: false, status: "todo" },
  { id: "playlist", title: "Queue the after-hours playlist", description: "Quiet instrumentals for a room full of curious people.", tag: "Music", priority: 3, minutes: 15, outdoor: false, status: "done" },
  { id: "question", title: "Collect one impossible question", description: "Ask everyone what they would like the universe to explain.", tag: "Science", priority: 2, minutes: 10, outdoor: false, status: "todo" }
];

const taskBoard = document.getElementById("task-board");
const boardSearch = document.getElementById("board-search");
const tagFilter = document.getElementById("tag-filter");
const prioritySort = document.getElementById("priority-sort");
let boardNotice = "Start with one small step. Finish an active task to make room for the next.";
let boardHasError = false;

function boardElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function getBoardStats() {
  const stats = { done: 0, active: 0, remainingMinutes: 0 };
  // A manual loop calculates global counts and remaining work.
  for (const task of tasks) {
    if (task.status === "done") stats.done += 1;
    else stats.remainingMinutes += task.minutes;
    if (task.status === "active") stats.active += 1;
  }
  return stats;
}

function renderBoard(focusTarget = null) {
  const stats = getBoardStats();
  const query = boardSearch.value.trim().toLowerCase();
  const selectedTag = tagFilter.value;

  // Derive departments from data, so adding a new tag needs no HTML change.
  tagFilter.replaceChildren(new Option("All departments", "all"));
  for (const tag of new Set(tasks.map((task) => task.tag))) {
    tagFilter.add(new Option(tag, tag));
  }
  tagFilter.value = [...tagFilter.options].some((option) => option.value === selectedTag) ? selectedTag : "all";
  const visible = tasks.filter((task) =>
    (tagFilter.value === "all" || task.tag === tagFilter.value) &&
    `${task.title} ${task.description} ${task.tag}`.toLowerCase().includes(query)
  );
  visible.sort((a, b) => prioritySort.value === "title" ? a.title.localeCompare(b.title)
    : a.priority - b.priority || a.title.localeCompare(b.title));

  taskBoard.replaceChildren();
  for (const column of COLUMNS) {
    const section = boardElement("section", undefined, "kanban-column");
    section.dataset.status = column.id;
    const heading = boardElement("div", undefined, "column-heading");
    const title = boardElement("h3", column.title);
    title.id = `column-${column.id}`;
    section.setAttribute("aria-labelledby", title.id);
    const columnTasks = visible.filter((task) => task.status === column.id);
    const totalCount = tasks.filter((task) => task.status === column.id).length;
    heading.append(title, boardElement("span", column.id === "active"
      ? `${totalCount} / ${ACTIVE_LIMIT}` : String(totalCount)));
    section.append(heading);

    if (columnTasks.length === 0) {
      section.append(boardElement("p", "No matching tasks in this column.", "empty-state"));
    }
    for (const task of columnTasks) {
      const card = boardElement("article", undefined, "task-card");
      card.dataset.id = task.id;
      const meta = boardElement("div", undefined, "card-meta");
      meta.append(boardElement("span", task.tag, "tag"),
        boardElement("span", PRIORITY_NAMES[task.priority], `priority-${task.priority}`));
      card.append(meta, boardElement("h4", task.title), boardElement("p", task.description),
        boardElement("div", `${task.minutes} MIN / ${task.outdoor ? "OUTDOOR" : "INDOOR"}`, "task-time"));
      const actions = boardElement("div", undefined, "card-actions");
      const index = COLUMNS.findIndex((entry) => entry.id === task.status);
      const targets = [];
      if (index > 0) targets.push(COLUMNS[index - 1]);
      if (index < COLUMNS.length - 1) targets.push(COLUMNS[index + 1]);
      let blocked = false;
      for (const target of targets) {
        const forward = COLUMNS.indexOf(target) > index;
        const button = boardElement("button", `${forward ? "→" : "←"} ${target.title}`, forward ? "move-forward" : "");
        button.type = "button";
        button.dataset.id = task.id;
        button.dataset.target = target.id;
        button.setAttribute("aria-label", `Move ${task.title} to ${target.title}`);
        if (target.id === "active" && stats.active >= ACTIVE_LIMIT) {
          button.setAttribute("aria-disabled", "true");
          button.setAttribute("aria-describedby", `limit-${task.id}`);
          blocked = true;
        }
        actions.append(button);
      }
      card.append(actions);
      if (blocked) {
        const reason = boardElement("p", `In progress is full (${ACTIVE_LIMIT}/${ACTIVE_LIMIT}). Move an active task first.`, "card-rule");
        reason.id = `limit-${task.id}`;
        card.append(reason);
      }
      section.append(card);
    }
    taskBoard.append(section);
  }

  document.getElementById("board-progress").value = tasks.length ? stats.done / tasks.length * 100 : 0;
  document.getElementById("board-progress-text").textContent = `${stats.done} / ${tasks.length} COMPLETE`;
  document.getElementById("board-summary").textContent = `${visible.length} of ${tasks.length} tasks shown · ${stats.remainingMinutes} minutes of work remaining`;
  const notice = document.getElementById("board-message");
  notice.textContent = visible.length === 0 ? "No tasks found. Try another search or department." : boardNotice;
  notice.classList.toggle("is-error", boardHasError);

  // Rebuilding the DOM must not strand a keyboard user on the page body.
  if (focusTarget) {
    const buttons = [...taskBoard.querySelectorAll("button[data-id]")];
    const restored = buttons.find((button) => button.dataset.id === focusTarget.id && button.dataset.target === focusTarget.target)
      || buttons.find((button) => button.dataset.id === focusTarget.id);
    if (restored) restored.focus({ preventScroll: true });
  }
}

// One listener handles all existing and future card buttons via bubbling.
taskBoard.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button || !taskBoard.contains(button)) return;
  const task = tasks.find((item) => item.id === button.dataset.id);
  const target = button.dataset.target;
  const fromIndex = task ? COLUMNS.findIndex((column) => column.id === task.status) : -1;
  const toIndex = COLUMNS.findIndex((column) => column.id === target);
  if (!task || fromIndex < 0 || toIndex < 0 || Math.abs(fromIndex - toIndex) !== 1) return;
  if (target === "active" && getBoardStats().active >= ACTIVE_LIMIT) {
    boardNotice = `Move blocked: In progress allows only ${ACTIVE_LIMIT} tasks. Finish or move one first.`;
    boardHasError = true;
  } else {
    task.status = target; // Change data first, then render the entire view.
    boardNotice = `“${task.title}” moved to ${COLUMNS[toIndex].title}.`;
    boardHasError = false;
  }
  renderBoard({ id: task.id, target });
});

for (const control of [boardSearch, tagFilter, prioritySort]) {
  control.addEventListener(control === boardSearch ? "input" : "change", () => {
    boardHasError = false;
    boardNotice = "View updated. Move a task to keep the evening on track.";
    renderBoard();
  });
}
renderBoard();
