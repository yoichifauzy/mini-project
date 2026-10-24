# Design — To-Do List Life Dashboard

## File Structure
```
mini-project/
├── index.html          # Single HTML page, all layout
├── css/
│   └── style.css       # All styles, light + dark themes via CSS custom properties
├── js/
│   └── app.js          # All logic — clock, greeting, timer, todos, links
└── .kiro/
    └── specs/
        └── life-dashboard/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

## Architecture

Single-page, zero-dependency web app. No build step.

```
index.html
  └── loads css/style.css
  └── loads js/app.js (deferred via placement at end of body)
        ├── Module: Clock & Date
        ├── Module: Greeting + Custom Name
        ├── Module: Theme (Light/Dark)
        ├── Module: Focus Timer
        ├── Module: To-Do List
        └── Module: Quick Links
```

## Data Model (localStorage)

| Key            | Type        | Shape                                |
|----------------|-------------|--------------------------------------|
| `ld_theme`     | `string`    | `"light"` \| `"dark"`               |
| `ld_name`      | `string`    | `"Alice"` (empty string = no name)  |
| `ld_pomo_dur`  | `number`    | minutes (default `25`)              |
| `ld_todos`     | `Todo[]`    | `{id:number, text:string, done:boolean}[]` |
| `ld_links`     | `Link[]`    | `{id:number, name:string, url:string}[]`   |

## UI Sections

```
┌─────────────────────────────────────────────────────┐
│  HEADER: [🕐 HH:MM:SS]  [Date]          [🌙 toggle] │
├─────────────────────────────────────────────────────┤
│        GREETING: "Good Morning, Alice 👋"  [✏️]     │
├──────────────┬──────────────────┬───────────────────┤
│ FOCUS TIMER  │   TO-DO LIST     │   QUICK LINKS     │
│  [min input] │ [input] [Add]    │ [label][url][Add] │
│   25:00      │ Sort: A-Z Z-A…   │  [Link1] [Link2]  │
│ Start Stop ↺ │ ☐ Task one  ✏🗑  │                   │
│   "Ready"    │ ☑ Task two  ✏🗑  │                   │
└──────────────┴──────────────────┴───────────────────┘
```

## Theme Strategy

CSS custom properties on `:root` for light mode.  
`[data-theme="dark"]` on `<html>` overrides them for dark mode.  
All colours reference `var(--*)` tokens — zero JS colour logic.

## Security

- `escapeHtml()` applied to all user-supplied text rendered via `innerHTML`
- Link `href` validated with `new URL()` before saving
- `rel="noopener noreferrer"` on all external links
