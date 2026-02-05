// src/command/command.selectors.js
export function getCommandUIState(cmd) {
  if (!cmd) return null;

  if (cmd.status === "pending") {
    return { label: "Pending", icon: "⏳", color: "gray" };
  }

  if (cmd.status === "sent" && cmd.retryCount > 0) {
    return { label: `Retrying (${cmd.retryCount})`, icon: "🔁", color: "orange" };
  }

  if (cmd.status === "sent") {
    return { label: "In Progress", icon: "📡", color: "blue" };
  }

  if (cmd.status === "success") {
    return { label: "Success", icon: "✅", color: "green" };
  }

  if (cmd.status === "failed") {
    return { label: "Failed", icon: "❌", color: "red" };
  }

  return null;
}
