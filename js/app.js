// app.js

// ===========================================
// app.js — Main Application Controller
// ===========================================
//
// Responsibilities:
//   • Initialize app (load dues, render UI)
//   • Handle form submissions (add/edit)
//   • Bind UI actions (mark done, delete, edit)
//   • Manage localStorage & UI synchronization
//   • Register service worker
//   • Connect notification + theme modules
// ===========================================

import { DueItem } from "./model.js";
import {
  loadDues,
  saveDues,
  addDue,
  updateDue,
  deleteDue,
  clearAllDues,
} from "./storage.js";
import { renderDues, renderSummary } from "./ui.js";
import { sortDues, focusAndScrollToForm } from "./utils.js";
import { requestPermission, testNotification } from "./notifications.js";
import { initTheme, toggleTheme } from "./theme.js";

// === Global State ===
let dues = [];
let editId = null;

// === DOM References ===
const form = document.getElementById("due-form");
const toggleFormBtn = document.getElementById("toggle-form-btn");
const fabAdd = document.getElementById("fab-add");
const cancelEditBtn = document.getElementById("cancel-edit");
const clearDataBtn = document.getElementById("clear-data");
const themeToggleBtn = document.getElementById("theme-toggle");

// === Initialization ===
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  initTheme();

  dues = loadDues();
  renderAll();

  // Bind form submission
  form.addEventListener("submit", handleSubmit);

  // Cancel edit
  cancelEditBtn.addEventListener("click", resetForm);

  // Toggle form visibility (desktop button + FAB)
  toggleFormBtn.addEventListener("click", toggleFormVisibility);
  fabAdd.addEventListener("click", toggleFormVisibility);

  // Settings buttons
  document
    .getElementById("request-permission")
    .addEventListener("click", requestPermission);
  document
    .getElementById("test-notify")
    .addEventListener("click", testNotification);
  clearDataBtn.addEventListener("click", handleClearAll);
  themeToggleBtn.addEventListener("click", toggleTheme);
}

// === Core Functions ===

// Handle add / edit form submission
function handleSubmit(e) {
  e.preventDefault();

  const title = form.title.value.trim();
  const category = form.category.value;
  const dueDate = form.dueDate.value;
  const amount = form.amount.value;
  const priority = form.priority.value;

  if (!title || !dueDate) return;

  if (editId) {
    // Update existing due
    const idx = dues.findIndex((d) => d.id === editId);
    // app.js (Corrected Edit Block - Updates the existing DueItem instance)
    if (idx !== -1) {
      const itemToUpdate = dues[idx];

      // Update the properties directly on the existing DueItem instance
      itemToUpdate.title = title;
      itemToUpdate.category = category;
      itemToUpdate.dueDate = dueDate;
      itemToUpdate.amount = amount;
      itemToUpdate.priority = priority;

      // The dues array item is updated by reference, and it's still a DueItem instance
      saveDues(dues); // saveDues can now call .toJSON() successfully
    }
    editId = null;
  } else {
    // Add new due
    const newDue = new DueItem({ title, category, dueDate, amount, priority });
    addDue(newDue);
    dues.push(newDue);
  }

  resetForm();
  renderAll();
}

// Render everything again
function renderAll() {
  dues = loadDues(); // re-sync
  renderDues(dues, handleEdit, handleDelete, handleToggleDone);
  renderSummary(dues);
}

// Edit existing due
function handleEdit(id) {
  const due = dues.find((d) => d.id === id);
  if (!due) return;

  // ---- 1️⃣ Populate form fields ----
  form.title.value = due.title;
  form.category.value = due.category;
  form.dueDate.value = due.dueDate;
  form.amount.value = due.amount;
  form.priority.value = due.priority;

  // ---- 2️⃣ Update form state ----
  editId = id;
  form.querySelector("button[type='submit']").textContent = "Update Due";
  cancelEditBtn.style.display = "inline-block";

  // ---- 3️⃣ Make sure the form is visible ----
  showForm(); // must make form visible (remove display:none etc.)

  // ---- 4️⃣ Smooth scroll and focus ----
  focusAndScrollToForm(form);
}

// Delete due
function handleDelete(id) {
  if (confirm("Delete this due permanently?")) {
    deleteDue(id);
    dues = dues.filter((d) => d.id !== id);
    renderAll();
  }
}

// Toggle done / undone
function handleToggleDone(id) {
  const item = dues.find((d) => d.id === id); // Find the item instance

  if (item) {
    // 1. Use the dedicated storage function to update the persistent data.
    // updateDue will load, modify, and save the item in localStorage.
    updateDue(id, { done: !item.done });

    // 2. Update the local array instance directly (by reference) for immediate UI consistency
    // This makes the subsequent renderAll operation faster/more reliable.
    item.done = !item.done;

    renderAll();
  }
}

// Clear all stored data
function handleClearAll() {
  if (confirm("⚠️ Clear all due items? This cannot be undone.")) {
    clearAllDues();
    dues = [];
    renderAll();
  }
}

// === Form Helpers ===

function resetForm() {
  form.reset();
  editId = null;
  cancelEditBtn.style.display = "none";
  form.querySelector("button[type='submit']").textContent = "Add Due";
  hideForm();
}

function toggleFormVisibility() {
  const formSection = document.getElementById("form-section");
  const isVisible = formSection.classList.toggle("visible");

  // Show or hide the form
  form.style.display = isVisible ? "block" : "none";

  // Update both buttons (main + floating)
  const icon = isVisible ? "x" : "+";
  toggleFormBtn.textContent = icon;
  fabAdd.textContent = icon;

  // When form is shown, scroll smoothly and focus
  if (isVisible) {
    focusAndScrollToForm(form);
  }
}

function showForm() {
  document.getElementById("form-section").classList.add("visible");
  form.style.display = "block";
  toggleFormBtn.textContent = "x";
  fabAdd.textContent = "x";
}

function hideForm() {
  document.getElementById("form-section").classList.remove("visible");
  form.style.display = "none";
  toggleFormBtn.textContent = "+";
  fabAdd.textContent = "+";
}

// ================================
// PWA: Service Worker Registration
// ================================
//
// Registers the service worker (if supported by browser)
// to enable offline access, caching, and installation prompt.
//

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./service-worker.js");
      console.log("✅ Service Worker registered:", reg.scope);

      // 1️⃣ If there's already a waiting SW (page loaded after update)
      if (reg.waiting) {
        promptUserToRefresh(reg);
      }

      // 2️⃣ Listen for new SW installs
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;

        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // A new version is available
            promptUserToRefresh(reg);
          }
        });
      });
    } catch (err) {
      console.warn("⚠️ Service Worker registration failed:", err);
    }
  });
}

function promptUserToRefresh(registration) {
  const shouldRefresh = confirm(
    "🚀 A new version of DueWatcher is available.\nRefresh now?"
  );

  if (shouldRefresh && registration.waiting) {
    // Tell the waiting service worker to activate
    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    // Reload once the new SW takes control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }
}
