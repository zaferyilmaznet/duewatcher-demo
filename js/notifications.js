// notifications.js

// ===========================================
// notifications.js — Notifications Management
// ===========================================
//
// Responsibilities:
//   • Request browser notification permission
//   • Send test notification
//   • (Future) Trigger reminders for due items
// ===========================================

// Request permission from the user
export function requestPermission() {
  if (!("Notification" in window)) {
    alert("❌ Notifications are not supported in this browser.");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      alert("✅ Notifications enabled!");
      updatePermissionButton(true);
    } else if (permission === "denied") {
      alert("🚫 You blocked notifications. Enable them in browser settings.");
      updatePermissionButton(false);
    }
  });
}

// Send a test notification
export function testNotification() {
  if (!("Notification" in window)) {
    alert("❌ Notifications not supported.");
    return;
  }

  if (Notification.permission !== "granted") {
    alert("⚠️ Please enable notifications first.");
    return;
  }

  new Notification("🔔 DueWatcher Test", {
    body: "This is a sample notification from DueWatcher.",
    icon: "icons/icon-96.png",
  });
}

// Future: Check if any dues are close to due date and send notifications
export function checkReminders(dues) {
  if (Notification.permission !== "granted") return;

  const notifyEnabled = document.getElementById("notify-enabled").checked;
  if (!notifyEnabled) return;

  const daysBefore = parseInt(
    document.getElementById("notify-days").value || "3",
    10
  );
  const now = new Date();

  dues.forEach((due) => {
    if (due.done) return; // skip completed
    const dueDate = new Date(due.dueDate);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays === daysBefore) {
      new Notification("📅 Reminder: " + due.title, {
        body: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""} (${
          due.category
        })`,
        icon: "icons/icon-96.png",
      });
    }
  });
}

// Utility: disable permission button if already granted
export function updatePermissionButton(isGranted = false) {
  const btn = document.getElementById("request-permission");
  if (!btn) return;

  if (Notification.permission === "granted" || isGranted) {
    btn.disabled = true;
    btn.textContent = "✅ Notifications Enabled";
  } else {
    btn.disabled = false;
    btn.textContent = "🔔 Request Notification Permission";
  }
}

// Auto-check permission state at startup
document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window) {
    updatePermissionButton(Notification.permission === "granted");
  }
});
