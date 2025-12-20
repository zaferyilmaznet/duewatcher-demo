// theme.js

// ===========================================
// theme.js — Theme Management (Light/Dark)
// ===========================================
//
// Responsibilities:
//   • Initialize theme based on saved preference or system default
//   • Toggle between light/dark themes
//   • Persist user selection in localStorage
//   • Sync <meta name="theme-color"> with theme
// ===========================================

const THEME_KEY = "dw_theme";
const metaThemeColor = document.querySelector('meta[name="theme-color"]');

/**
 * Initialize theme on app load
 * - Load from localStorage if exists
 * - Otherwise detect system preference
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");

  applyTheme(theme);

  // Listen for toggle click
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
}

/**
 * Apply a given theme
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);

  // Update meta theme color for mobile status bar tint
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      theme === "dark" ? "#121212" : "#1976d2"
    );
  }

  // Update button label dynamically
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}
