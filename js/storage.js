// storage.js

// ===========================
// storage.js — Local Data Persistence
// ===========================
//
// Responsible for saving, loading, updating, and deleting DueItems
// in localStorage. This ensures offline capability for the app.
//
// Uses JSON serialization. Data key: "duewatcher_dues"
// ===========================

import { DueItem } from "./model.js";

const STORAGE_KEY = "duewatcher_dues_v1-0-0-alpha-1";

/**
 * Load all due items from localStorage.
 * Returns an array of DueItem instances.
 */
export function loadDues() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return parsed.map((data) => new DueItem(data));
  } catch (err) {
    console.error("⚠️ Failed to parse stored dues:", err);
    return [];
  }
}

/**
 * Save an array of dues to localStorage.
 * @param {DueItem[]} dues
 */
export function saveDues(dues) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(dues.map((d) => d.toJSON()))
  );
}

/**
 * Add a new due item and persist it.
 * @param {DueItem} due
 */
export function addDue(due) {
  // the flow: load -> modify array -> save

  // Load the existing array of DueItem instances
  const existingDues = loadDues();

  // Push the new DueItem instance
  existingDues.push(due);

  // Save the entire array (which now includes the new item)
  saveDues(existingDues);
}

/**
 * Update an existing due by its ID.
 * @param {string} id
 * @param {Partial<DueItem>} updates
 */
export function updateDue(id, updates) {
  const dues = loadDues();
  const index = dues.findIndex((d) => d.id === id);
  if (index !== -1) {
    Object.assign(dues[index], updates); // ✅ Safe mutation on DueItem instance
    saveDues(dues);
  }
}

/**
 * Delete a due by ID.
 * @param {string} id
 */
export function deleteDue(id) {
  const dues = loadDues().filter((d) => d.id !== id);
  saveDues(dues);
}

/**
 * Clear all stored dues.
 * Use with caution — wipes all data.
 */
export function clearAllDues() {
  localStorage.removeItem(STORAGE_KEY);
}
