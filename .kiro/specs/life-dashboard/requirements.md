# Requirements — To-Do List Life Dashboard

## Technical Constraints

### TC-1: Technology Stack
- HTML for structure
- CSS for styling
- Vanilla JavaScript (no frameworks like React, Vue, etc.)
- No backend server required

### TC-2: Data Storage
- Use browser Local Storage API
- All data stored client-side only

### TC-3: Browser Compatibility
- Must work in modern browsers (Chrome, Firefox, Edge, Safari)
- Can be used as standalone web app or browser extension

---

## Non-Functional Requirements

### NFR-1: Simplicity
- Clean, minimal interface
- Easy to understand and use
- No complex setup required
- No test setup required

### NFR-2: Performance
- Fast load time
- Responsive UI interactions
- No noticeable lag when updating data

### NFR-3: Visual Design
- User-friendly aesthetic
- Clear visual hierarchy
- Readable typography

---

## Required Features (MVP)

### F-1: Greeting
- WHEN the page loads THEN display a greeting based on the current time of day
  - 00:00–04:59 → "Good Night"
  - 05:00–11:59 → "Good Morning"
  - 12:00–16:59 → "Good Afternoon"
  - 17:00–20:59 → "Good Evening"
  - 21:00–23:59 → "Good Night"
- WHEN the page loads THEN show the current time (HH:MM:SS, live)
- WHEN the page loads THEN show the current date (Day, DD Month YYYY)

### F-2: Focus Timer
- WHEN the page loads THEN display a 25-minute countdown timer (default)
- WHEN the user clicks Start THEN the timer counts down each second
- WHEN the user clicks Stop THEN the timer pauses at current value
- WHEN the user clicks Reset THEN the timer resets to the configured duration
- WHEN the timer reaches 00:00 THEN show a completion message

### F-3: To-Do List
- WHEN the user types a task and clicks Add (or presses Enter) THEN the task is added to the list
- WHEN the user clicks the checkbox on a task THEN the task is marked as done (strikethrough)
- WHEN the user clicks the edit button on a task THEN a modal opens to edit the task text
- WHEN the user saves the edited task THEN the list updates with the new text
- WHEN the user clicks the delete button on a task THEN the task is removed
- WHEN any task change occurs THEN the list is saved to localStorage
- WHEN the page loads THEN restore tasks from localStorage

### F-4: Quick Links
- WHEN the user enters a label and URL and clicks Add THEN a link button is added
- WHEN the user clicks a link button THEN the website opens in a new tab
- WHEN the user clicks delete on a link THEN the link is removed
- WHEN any link change occurs THEN links are saved to localStorage
- WHEN the page loads THEN restore links from localStorage

---

## Challenges (3 of 5 chosen)

### C-1: Light / Dark Mode
- WHEN the user clicks the theme toggle THEN switch between light and dark mode
- WHEN the user sets a theme THEN persist it in localStorage
- WHEN the page loads THEN apply the saved theme preference

### C-2: Custom Name in Greeting
- WHEN no name is set THEN show generic greeting (e.g. "Good Morning!")
- WHEN the user clicks the edit-name button THEN a modal opens to enter their name
- WHEN the user saves a name THEN the greeting shows "Good Morning, [Name] 👋"
- WHEN a name is set THEN persist it in localStorage

### C-3: Prevent Duplicate Tasks
- WHEN the user tries to add a task whose text (case-insensitive, trimmed) matches an existing task THEN show a warning and do NOT add the task
- WHEN the user edits a task to match another existing task THEN show a warning and do NOT save

### C-4: Change Pomodoro Time
- WHEN the user changes the session minutes input and clicks Apply THEN the timer resets to the new duration
- WHEN the page loads THEN restore the last-used duration from localStorage

### C-5: Sort Tasks
- WHEN the user clicks "A–Z" sort THEN render tasks sorted alphabetically ascending
- WHEN the user clicks "Z–A" sort THEN render tasks sorted alphabetically descending
- WHEN the user clicks "By Status" sort THEN render pending tasks before done tasks
- WHEN the user clicks "Default" sort THEN render tasks in original insertion order
