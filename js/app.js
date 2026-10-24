/**
 * Life Dashboard — app.js
 * ========================
 * Spec: .kiro/specs/life-dashboard/
 *
 * Modules
 *  1. Utilities
 *  2. Clock & Date          (F-1)
 *  3. Greeting + Name       (F-1, C-2)
 *  4. Light / Dark Theme    (C-1)
 *  5. Focus Timer           (F-2, C-4)
 *  6. To-Do List            (F-3, C-3, C-5)
 *  7. Quick Links           (F-4)
 *  8. Toast notifications
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. UTILITIES
   ───────────────────────────────────────────────────────────── */

/** Shorthand getElementById */
function $(id) { return document.getElementById(id); }

/** Zero-pad a number to 2 digits */
function pad(n) { return String(n).padStart(2, '0'); }

/** Safely parse JSON from localStorage */
function lsLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Stringify and write to localStorage */
function lsSave(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Escape user-supplied strings before inserting into innerHTML.
 * Prevents XSS.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Normalise a string for duplicate-checking */
function normalise(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/* ─────────────────────────────────────────────────────────────
   localStorage keys
   ───────────────────────────────────────────────────────────── */
const LS = {
  THEME   : 'ld_theme',
  NAME    : 'ld_name',
  POMO_DUR: 'ld_pomo_dur',
  TODOS   : 'ld_todos',
  LINKS   : 'ld_links',
};

/* ─────────────────────────────────────────────────────────────
   2. CLOCK & DATE  (F-1)
   ───────────────────────────────────────────────────────────── */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function updateClock() {
  const now = new Date();
  const clockEl = $('clock');
  const dateEl = $('date-display');
  if (clockEl) {
    clockEl.textContent =
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  if (dateEl) {
    dateEl.textContent =
      `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }
}

// Tick every second
setInterval(updateClock, 1000);
updateClock(); // immediate first render

/* ─────────────────────────────────────────────────────────────
   3. GREETING + CUSTOM NAME  (F-1, C-2)
   ───────────────────────────────────────────────────────────── */

/**
 * Returns time-based greeting phrase.
 * 00-04 → Good Night | 05-11 → Good Morning
 * 12-16 → Good Afternoon | 17-20 → Good Evening | 21-23 → Good Night
 */
function getGreetingPhrase() {
  const h = new Date().getHours();
  if (h <  5) return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
}

function renderGreeting() {
  const name = lsLoad(LS.NAME, '');
  const phrase = getGreetingPhrase();
  const greetingEl = $('greeting-text');
  const nameEl = $('greeting-name');

  if (greetingEl && nameEl) {
    if (name) {
      greetingEl.textContent = `${phrase},`;
      nameEl.textContent = name;
    } else {
      greetingEl.textContent = `${phrase}!`;
      nameEl.textContent = '';
    }
  }
}

renderGreeting();
// Re-check every minute — greeting phrase can change on the hour
setInterval(renderGreeting, 60_000);

// ── Name modal ──────────────────────────────────────────────
$('edit-name-btn').addEventListener('click', openNameModal);

function openNameModal() {
  $('name-input').value = lsLoad(LS.NAME, '');
  $('name-modal').classList.remove('hidden');
  $('name-input').focus();
}

function closeNameModal() {
  $('name-modal').classList.add('hidden');
}

$('name-cancel-btn').addEventListener('click', closeNameModal);

$('name-save-btn').addEventListener('click', saveName);
$('name-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveName();
  if (e.key === 'Escape') closeNameModal();
});

function saveName() {
  const val = $('name-input').value.trim();
  lsSave(LS.NAME, val);
  closeNameModal();
  renderGreeting();
}

/* ─────────────────────────────────────────────────────────────
   4. LIGHT / DARK THEME  (C-1)
   ───────────────────────────────────────────────────────────── */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  const themeText = $('theme-icon');
  const themeToggle = $('theme-toggle');

  if (themeText) {
    themeText.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.classList.toggle('active', isDark);
  }
  lsSave(LS.THEME, theme);
}

// Restore saved theme (default: light)
applyTheme(lsLoad(LS.THEME, 'light'));

$('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ─────────────────────────────────────────────────────────────
   5. FOCUS TIMER  (F-2, C-4)
   ───────────────────────────────────────────────────────────── */

let pomoDuration  = lsLoad(LS.POMO_DUR, 25); // minutes
let timerSeconds  = pomoDuration * 60;        // current countdown value
let timerInterval = null;
let timerRunning  = false;

// Sync input to stored duration
$('pomodoro-minutes').value = pomoDuration;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

function setTimerDisplay() {
  $('timer-display').textContent = formatTime(timerSeconds);
}

function setTimerStatus(msg) {
  $('timer-status').textContent = msg;
}

setTimerDisplay();

// ── Apply custom duration ────────────────────────────────────
$('apply-duration-btn').addEventListener('click', applyDuration);
$('pomodoro-minutes').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyDuration();
});

function applyDuration() {
  if (timerRunning) {
    showToast('Stop the timer before changing duration.');
    return;
  }
  const val = parseInt($('pomodoro-minutes').value, 10);
  if (!val || val < 1 || val > 180) {
    showToast('Enter a duration between 1 and 180 minutes.');
    return;
  }
  pomoDuration = val;
  timerSeconds = pomoDuration * 60;
  lsSave(LS.POMO_DUR, pomoDuration);
  setTimerDisplay();
  setTimerStatus(`Duration set to ${pomoDuration} min — Ready.`);
}

// ── Timer controls ───────────────────────────────────────────
$('timer-start').addEventListener('click', startTimer);
$('timer-stop').addEventListener('click',  stopTimer);
$('timer-reset').addEventListener('click', resetTimer);

function startTimer() {
  if (timerRunning) return;
  if (timerSeconds === 0) resetTimer();

  timerRunning = true;
  setTimerStatus('Focusing…');

  timerInterval = setInterval(() => {
    timerSeconds--;
    setTimerDisplay();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerStatus('Session complete! Take a break.');

      // Browser notification (best-effort)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Focus session complete!', {
          body: 'Great work — time for a break.',
        });
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerStatus('Paused.');
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerSeconds  = pomoDuration * 60;
  setTimerDisplay();
  setTimerStatus('Ready');
}

// Request notification permission (nice-to-have, silent fail)
if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
  Notification.requestPermission();
}

/* ─────────────────────────────────────────────────────────────
   6. TO-DO LIST  (F-3, C-3, C-5)
   ───────────────────────────────────────────────────────────── */

/**
 * @typedef {{ id: number, text: string, done: boolean }} Todo
 * @type {Todo[]}
 */
let todos = lsLoad(LS.TODOS, []);

let editingTodoId = null; // id of task currently being edited
let currentSort   = 'none';

function saveTodos() { lsSave(LS.TODOS, todos); }

// ── Duplicate check ──────────────────────────────────────────
/**
 * Returns true if another task already has the same normalised text.
 * @param {string} text
 * @param {number|null} excludeId  — id of task to exclude (for edits)
 */
function isDuplicate(text, excludeId = null) {
  const norm = normalise(text);
  return todos.some(t => t.id !== excludeId && normalise(t.text) === norm);
}

// ── Sorting ──────────────────────────────────────────────────
function getSortedTodos() {
  const copy = [...todos];
  switch (currentSort) {
    case 'az':     return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':     return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'status': return copy.sort((a, b) => Number(a.done) - Number(b.done));
    default:       return copy; // insertion order
  }
}

// ── Render ───────────────────────────────────────────────────
function renderTodos() {
  const list  = $('todo-list');
  const empty = $('todo-empty');
  list.innerHTML = '';

  const sorted = getSortedTodos();

  if (sorted.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  sorted.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <label class="todo-item__checkbox-label" title="Mark as ${todo.done ? 'pending' : 'completed'}">
        <input
          class="todo-item__check"
          type="checkbox"
          aria-label="Mark task as done"
          ${todo.done ? 'checked' : ''}
        />
        <span class="todo-item__custom-box"></span>
      </label>
      <span class="todo-item__text">${escapeHtml(todo.text)}</span>
      <div class="todo-item__actions">
        <button class="btn btn--ghost btn--sm todo-edit" title="Edit task" aria-label="Edit task">Edit</button>
        <button class="btn btn--danger-ghost btn--sm todo-delete" title="Delete task" aria-label="Delete task">Delete</button>
      </div>
    `;

    // Toggle done
    li.querySelector('.todo-item__check').addEventListener('change', (e) => {
      const t = todos.find(x => x.id === todo.id);
      if (t) {
        t.done = e.target.checked;
        saveTodos();
        renderTodos();
      }
    });

    // Open edit modal
    li.querySelector('.todo-edit').addEventListener('click', () => openEditModal(todo.id));

    // Delete
    li.querySelector('.todo-delete').addEventListener('click', () => {
      todos = todos.filter(x => x.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    list.appendChild(li);
  });
}

// ── Add task ─────────────────────────────────────────────────
$('todo-add-btn').addEventListener('click', addTodo);
$('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

function addTodo() {
  const text = $('todo-input').value.trim();
  if (!text) return;

  // C-3: Prevent duplicate tasks
  if (isDuplicate(text)) {
    showToast('Task already exists.');
    return;
  }

  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  renderTodos();

  $('todo-input').value = '';
  $('todo-input').focus();
}

// ── Edit modal ───────────────────────────────────────────────
function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editingTodoId = id;
  $('edit-task-input').value = todo.text;
  $('edit-modal').classList.remove('hidden');
  $('edit-task-input').select();
  $('edit-task-input').focus();
}

function closeEditModal() {
  $('edit-modal').classList.add('hidden');
  editingTodoId = null;
}

$('edit-cancel-btn').addEventListener('click', closeEditModal);
$('edit-save-btn').addEventListener('click', saveEditedTodo);
$('edit-task-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveEditedTodo();
  if (e.key === 'Escape') closeEditModal();
});

function saveEditedTodo() {
  const text = $('edit-task-input').value.trim();
  if (!text) return;

  // C-3: Prevent duplicate on edit (exclude the task being edited)
  if (isDuplicate(text, editingTodoId)) {
    showToast('A task with that name already exists.');
    return;
  }

  const todo = todos.find(t => t.id === editingTodoId);
  if (todo) {
    todo.text = text;
    saveTodos();
    renderTodos();
  }
  closeEditModal();
}

// ── Sort buttons ─────────────────────────────────────────────
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentSort = btn.dataset.sort;
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active-sort'));
    btn.classList.add('active-sort');
    renderTodos();
  });
});

// Initial render
renderTodos();

/* ─────────────────────────────────────────────────────────────
   7. QUICK LINKS  (F-4)
   ───────────────────────────────────────────────────────────── */

/**
 * @typedef {{ id: number, name: string, url: string }} Link
 * @type {Link[]}
 */
let links = lsLoad(LS.LINKS, []);

function saveLinks() { lsSave(LS.LINKS, links); }

function renderLinks() {
  const grid  = $('links-grid');
  const empty = $('links-empty');
  grid.innerHTML = '';

  if (links.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  links.forEach(link => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';
    chip.innerHTML = `
      <a
        class="link-chip__anchor"
        href="${escapeHtml(link.url)}"
        target="_blank"
        rel="noopener noreferrer"
        title="${escapeHtml(link.url)}"
      >${escapeHtml(link.name)}</a>
      <button
        class="link-chip__delete"
        data-id="${link.id}"
        title="Remove link"
        aria-label="Remove ${escapeHtml(link.name)}"
      >Delete</button>
    `;

    chip.querySelector('.link-chip__delete').addEventListener('click', () => {
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    grid.appendChild(chip);
  });
}

$('link-add-btn').addEventListener('click', addLink);
$('link-url-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addLink();
});

function addLink() {
  const name = $('link-name-input').value.trim();
  let   url  = $('link-url-input').value.trim();

  if (!name || !url) {
    showToast('Please fill in both label and URL.');
    return;
  }

  // Auto-prepend https:// if the user skipped the protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Validate URL structure
  try { new URL(url); } catch {
    showToast('Please enter a valid URL.');
    return;
  }

  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();

  $('link-name-input').value = '';
  $('link-url-input').value  = '';
  $('link-name-input').focus();
}

// Initial render
renderLinks();

/* ─────────────────────────────────────────────────────────────
   8. TOAST NOTIFICATIONS
   ───────────────────────────────────────────────────────────── */
let toastTimer = null;

/**
 * Show a temporary toast message.
 * @param {string} message
 * @param {number} [duration=3000]  ms before auto-hide
 */
function showToast(message, duration = 3000) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL: Close any modal by clicking the backdrop
   ───────────────────────────────────────────────────────────── */
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      // Clean up editing state if the edit modal is dismissed via backdrop
      if (modal.id === 'edit-modal') editingTodoId = null;
    }
  });
});
