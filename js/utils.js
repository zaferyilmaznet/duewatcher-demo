// utils.js

// ===========================
// utils.js — General Helpers
// ===========================
//
// Provides small, pure utility functions used across the app:
//  - Date helpers
//  - Sorting (by due date, priority, done status)
//  - Weighted scoring (for meaningful order)
// ===========================

/**
 * Parse a date string (YYYY-MM-DD) safely.
 * Returns a Date instance, or today's date if invalid.
 */
export function parseDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Calculate the number of days between now and a given due date.
 * Positive if due in future, negative if overdue.
 */
export function daysUntil(dueDate) {
  const today = new Date();
  const diffMs = parseDate(dueDate) - today;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Weighted scoring system for sorting dues:
 *  - Items marked as done go to the end.
 *  - Among remaining items, higher priority and sooner due date rank higher.
 *  - Date proximity is always dominant -
 *  - Priority only reshuffles near-date items
 *  - Overdue items float to the top naturally
 *
 * @param {object} due - A DueItem
 * @returns {number} numeric score (lower = higher priority)
 */
export function computeDueScore(due) {
  if (due.done) return Infinity; // done items always go last

  const days = Math.max(0, daysUntil(due.dueDate));

  const priorityMultiplier =
    due.priority === "high" ? 0.6 : due.priority === "medium" ? 1.0 : 1.4;

  return days * priorityMultiplier;
}

/**
 * Sort dues:
 * 1. By done status (not done first)
 * 2. Then by weighted score (priority + due date)
 */
export function sortDues(dues) {
  return [...dues].sort((a, b) => {
    const aDone = a.done ? 1 : 0;
    const bDone = b.done ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return computeDueScore(a) - computeDueScore(b);
  });
}

/**
 * Format date for display: "MMM DD, YYYY"
 */
export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate a unique ID (used for new dues)
 */
export function generateId() {
  return `due-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Map category names to emojis
const CATEGORY_ICONS = {
  project: "📁",
  finance: "💰",
  personal: "🏡",
  other: "🗂️",
};

// Helper to get emoji for a category
export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || "📌";
}

/**
 * Smoothly scrolls the form into view, focuses the title field,
 * and adds a temporary highlight to draw attention.
 */
export function focusAndScrollToForm(formEl) {
  if (!formEl) return;

  const focusTarget = formEl.title || formEl.querySelector("#title");

  const doScroll = () => {
    formEl.scrollIntoView({ behavior: "smooth", block: "start" });

    // Focus + select input for better UX
    if (focusTarget) {
      focusTarget.focus();
      if (typeof focusTarget.select === "function") focusTarget.select();
    }

    // Temporary highlight pulse
    formEl.classList.add("highlight");
    setTimeout(() => formEl.classList.remove("highlight"), 1200);
  };

  // Use animation frame for smoother timing
  if (window.requestAnimationFrame) {
    requestAnimationFrame(() => requestAnimationFrame(doScroll));
  } else {
    setTimeout(doScroll, 100);
  }
}
