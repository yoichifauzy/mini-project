# Tasks — To-Do List Life Dashboard

## Task 1 — Project Scaffold ✅
- [x] Create `index.html` with semantic HTML structure
- [x] Create `css/style.css` with CSS custom properties for light/dark themes
- [x] Create `js/app.js` entry point

## Task 2 — Clock & Date (F-1) ✅
- [x] Display live HH:MM:SS clock updating every second
- [x] Display current day, date, month, year

## Task 3 — Greeting + Custom Name (F-1, C-2) ✅
- [x] Time-based greeting text
- [x] Edit-name modal with localStorage persistence
- [x] Greeting updates every minute

## Task 4 — Light / Dark Mode (C-1) ✅
- [x] Toggle button in header
- [x] `data-theme` attribute on `<html>` drives CSS variables
- [x] Preference saved and restored from localStorage

## Task 5 — Focus Timer (F-2, C-4) ✅
- [x] Countdown display in MM:SS format
- [x] Start / Stop / Reset buttons
- [x] Custom duration input with Apply button (1–180 min)
- [x] Duration persisted in localStorage
- [x] Completion message when timer hits 00:00

## Task 6 — To-Do List (F-3, C-3, C-5) ✅
- [x] Add task via input + button or Enter key
- [x] Mark done via checkbox (strikethrough style)
- [x] Edit task via modal
- [x] Delete task
- [x] Persist to localStorage on every change
- [x] Restore from localStorage on load
- [x] Prevent duplicate tasks (case-insensitive)
- [x] Sort: A–Z, Z–A, By Status, Default

## Task 7 — Quick Links (F-4) ✅
- [x] Add link with label + URL
- [x] Auto-prepend https:// if missing
- [x] Validate URL with `new URL()`
- [x] Open in new tab with noopener noreferrer
- [x] Delete link
- [x] Persist and restore from localStorage

## Task 8 — Polish ✅
- [x] Responsive layout (mobile ≤ 640px)
- [x] Keyboard navigation (Enter / Escape on modals)
- [x] Toast notifications for warnings
- [x] XSS protection via escapeHtml()
- [x] Empty-state hints for todo list and links
