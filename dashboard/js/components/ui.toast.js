// dashboard/js/components/ui.toast.js

let toastTimer = null;

/**
 * Simple UI toast / warning message
 */
export function showToast(message, type = "warning", timeout = 3000) {
  let toast = document.getElementById("__ui_toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "__ui_toast";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.zIndex = "9999";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "14px";
    toast.style.color = "#fff";
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    document.body.appendChild(toast);
  }

  toast.style.background =
    type === "error" ? "#d32f2f" :
    type === "success" ? "#2e7d32" :
    "#ed6c02";

  toast.textContent = message;
  toast.style.display = "block";

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, timeout);
}
