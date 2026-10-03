# 📅 DueWatcher

> **Track deadlines, payments, and important dates — privately, offline.**  
> A lightweight PWA built with vanilla JS, local storage, and modern web APIs.

---

## 🌟 Overview

**DueWatcher** is a privacy-friendly, offline-capable Progressive Web App (PWA) for managing _anything with a due date_.  
It’s designed for both **personal** and **business (B2B)** contexts — from bills and project milestones to shipment deadlines and anniversaries.

You can:

- Add due items with titles, due dates, priorities, and optional amounts.
- Get **smart notifications** before deadlines.
- Track **completion (done)** status.
- Use it **offline** — data is saved locally, not to any server.
- Install it as a PWA on desktop or mobile.

---

## 🧩 Project Structure

```
duewatcher/
├── index.html # Main app page
├── manifest.json # PWA metadata
├── service-worker.js # Offline caching logic
├── icons/ # PWA icons
│ ├── icon-72.png
│ ├── icon-96.png
│ ├── icon-192.png
│ └── icon-512.png
│
├── css/
│ └── main.css # Unified responsive, theme-ready stylesheet
│
└── js/
├── app.js # Entry point: orchestrates modules
├── model.js # DueItem class definition
├── storage.js # LocalStorage wrapper (CRUD)
├── utils.js # Helpers (sorting, dates, formatting)
├── ui.js # DOM rendering and interactions
├── notifications.js # Notification permissions + scheduling
└── theme.js # Theme detection and toggle logic
```

---

## ⚙️ Tech Stack

- **Vanilla JavaScript (ES Modules)** — no frameworks.
- **HTML5 + CSS3** — modern, responsive layout.
- **LocalStorage** — for persistent offline data.
- **Notifications API** — for deadline reminders.
- **Service Worker** — enables offline mode and caching.
- **Manifest.json** — makes it installable as a PWA.

---

## 🚀 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/zaferyilmaznet/duewatcher-demo.git
   cd duewatcher-demo

   ```

2. Open in a local server (for PWA/service worker support):

npx serve

or open via VS Code’s Live Server.

3. Visit:

http://localhost:5000

4. Add your first due item — works offline immediately!

---

🧱 Core Concepts

1. Due Items

Each item represents a single commitment (bill, task, project, event).
Defined by the DueItem class:

- Property Type Description
- id string Unique identifier
- title string Title or short description
- dueDate string ISO date string
- category string e.g. project, finance, personal
- priority string high, medium, or low
- amount number? Optional, for bills or payments
- done boolean Marks the item as completed

2. Sorting Logic (Weighted Scoring)

Items are ordered by urgency × importance, using a weighted scoring system.
Completed (“done”) items are sent to the bottom of the list.

3. Theme System

Automatically detects system theme (light / dark)
and lets the user toggle manually via the “🌓 Toggle Theme” button.

Settings are saved in localStorage and applied on next load.

4. Notifications

Uses Notification API (requires user permission).
Respects notify-enabled and notify-days settings.
Checks deadlines every time the app is opened.
Can send test notifications via “🧪 Test Notification” button.

5. Data Management

Stored locally using the storage.js module.
Users can:
Add / edit / delete due items.
Clear all data via the “🗑️ Clear All Data” button.

6. PWA Setup

The app:
Caches essential assets via service-worker.js
Works offline after first load.
Is installable on Android, iOS, or desktop.

7. Responsive Design

Mobile-first approach — major breakpoints:
<600px: stacked layout, FAB visible.
≥600px: expanded spacing, form and list side-by-side.

## 🧭 Roadmap / Future Enhancements

✅ Versioning notifications (“New version available — refresh?”)
🪄 Smart recurring dues
📊 Data analytics (monthly totals, charts)
☁️ Optional cloud sync (privacy-respecting)
🎨 Modular CSS / theme packs
🗓️ Calendar view integration
📊 IndexedDB for larger datasets, it’s asynchronous and won’t block rendering like localStorage.

## 🧠 Design Philosophy

Privacy-first: No tracking, analytics, or accounts.
Simplicity: Works entirely offline.
Extensible: Modular JS files — easy to replace or enhance.
Accessible: Semantic HTML, keyboard-friendly, ARIA labels.

## 🧩 License

MIT License © 2025 Zafer Yilmaz - [zaferyilmaz.net](https://zaferyilmaz.net/)
You’re free to use, modify, and distribute with attribution.

---
