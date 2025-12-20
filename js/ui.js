// ui.js

// ===========================
// ui.js — DOM Rendering Layer
// ===========================
//
// Responsible for visual updates:
//   • Rendering the dues list
//   • Rendering the summary section
//   • Handling in-list buttons (edit, delete, mark done)
//   • Reflecting dynamic styling (soon, overdue, done)
//
// Dependencies: utils.js (formatDate, daysUntil, sortDues)
// ===========================

import { formatDate, daysUntil, sortDues, getCategoryIcon } from "./utils.js";

/**
 * Render all dues into the list container.
 * @param {Array} dues - Array of DueItem objects.
 * @param {Function} onEdit - Callback when user clicks edit.
 * @param {Function} onDelete - Callback when user clicks delete.
 * @param {Function} onToggleDone - Callback when user marks done/undone.
 */
export function renderDues(dues, onEdit, onDelete, onToggleDone) {
  const listEl = document.getElementById("due-list");
  const emptyNote = document.getElementById("empty-note");

  listEl.innerHTML = "";

  if (dues.length === 0) {
    emptyNote.style.display = "block";
    return;
  }

  emptyNote.style.display = "none";

  // Apply sorting (done last, others by priority & date)
  const sorted = sortDues(dues);
  const today = new Date();

  sorted.forEach((due) => {
    const li = document.createElement("li");
    li.className = "due-item";

    // Compute visual state: overdue, soon, done
    const daysDiff = daysUntil(due.dueDate);

    if (due.done) li.classList.add("done");
    else if (daysDiff < 0) li.classList.add("overdue");
    else if (daysDiff <= 3) li.classList.add("soon");

    const priorityDots = {
      high: "🔴",
      medium: "🟠",
      low: "🟢",
    };

    // Build markup
    li.innerHTML = `
      <div class="due-info">        
        <strong class="due-title">${due.title}</strong>
        <small><span class="due-date">${formatDate(due.dueDate)}</span>
        <span class="due-amount">${
          due.amount ? `— $${Number(due.amount).toFixed(2)}` : ""
        }</span></small>
        <small class="due-meta">${getCategoryIcon(due.category)}${
      due.category
    } · ${priorityDots[due.priority]}${due.priority} priority</small>
      </div>

      <div class="due-actions">
        <button data-id="${due.id}" class="toggle-btn">${
      due.done ? "✅" : "☐"
    }</button>
        <button data-id="${due.id}" class="edit-btn">✏️</button>
        <button data-id="${due.id}" class="delete-btn">❌</button>
      </div>
    `;

    // Attach event listeners
    li.querySelector(".toggle-btn").addEventListener("click", () =>
      onToggleDone(due.id)
    );
    li.querySelector(".edit-btn").addEventListener("click", () =>
      onEdit(due.id)
    );
    li.querySelector(".delete-btn").addEventListener("click", () =>
      onDelete(due.id)
    );

    listEl.appendChild(li);
  });
}

/**
 * Render the summary card with quick stats.
 * @param {Array} dues
 */
export function renderSummary(dues) {
  const summaryEl = document.getElementById("summary");
  if (!summaryEl) return;

  // Clear previous content
  summaryEl.innerHTML = "";

  if (dues.length === 0) {
    // Remove summary styling when empty
    summaryEl.classList.remove("summary");
    return;
  }

  // Add summary styling only when there are dues
  summaryEl.classList.add("summary");

  const total = dues.length;
  const doneCount = dues.filter((d) => d.done).length;
  const overdue = dues.filter(
    (d) => !d.done && new Date(d.dueDate) < new Date()
  ).length;
  const upcoming = dues.filter(
    (d) => !d.done && new Date(d.dueDate) >= new Date()
  ).length;

  // Money-related stats ---
  const paidAmount = dues
    .filter((d) => d.done && d.amount)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const unpaidAmount = dues
    .filter((d) => !d.done && d.amount)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  summaryEl.innerHTML = `
    <div class="summary-card">

      <div class="summary-item">
        <span class="emoji">📋</span>
        <strong>${total}</strong>
        <small>Total</small>
      </div>

      <div class="summary-item">
        <span class="emoji">✔️</span>
        <strong>${doneCount}</strong>
        <small>Done</small>
      </div>

      <div class="summary-item">
        <span class="emoji">🚨</span>
        <strong>${overdue}</strong>
        <small>Overdue</small>
      </div>

      <div class="summary-item">
        <span class="emoji">⏳</span>
        <strong>${upcoming}</strong>
        <small>Upcoming</small>
      </div>

      <div class="summary-item">
        <span class="emoji">💰</span>
        <strong>$${paidAmount.toFixed(2)}</strong>
        <small>Paid</small>
      </div>

      <div class="summary-item">
        <span class="emoji">🧾</span>
        <strong>$${unpaidAmount.toFixed(2)}</strong>
        <small>Unpaid</small>
      </div>
      
    </div>
  `;
}
