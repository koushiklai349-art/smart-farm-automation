export function CommandCard(cmd) {
  const {
    uiState,
    name,
    module,
    retryCount,
    lastError,
    blockedReason,
    completedAt
  } = cmd;

  const badge = {
    IDLE: "⚪ Idle",
    RUNNING: "⏳ Running",
    SUCCESS: "✅ Success",
    FAILED: "❌ Failed",
    BLOCKED: "🔒 Blocked"
  }[uiState];

  const disabled =
    uiState === "RUNNING" || uiState === "BLOCKED";

  return `
    <div class="command-card state-${uiState.toLowerCase()}">
      <h3>${name}</h3>
      <div class="meta">${module || ""}</div>

      <div class="status">${badge}</div>

      ${
        uiState === "RUNNING"
          ? `<div class="hint">Retries: ${retryCount || 0}</div>`
          : ""
      }

      ${
        uiState === "FAILED" && lastError
          ? `<div class="error">${lastError}</div>`
          : ""
      }

      ${
        uiState === "BLOCKED"
          ? `<div class="hint">Reason: ${blockedReason}</div>`
          : ""
      }

      ${
        uiState === "SUCCESS" && completedAt
          ? `<div class="hint">
              Completed: ${new Date(
                completedAt
              ).toLocaleTimeString()}
            </div>`
          : ""
      }

      <div class="command-actions">
  <label class="toggle">
    <input
      type="checkbox"
      class="cmd-toggle"
      data-id="${cmd.id}"
      ${cmd.action === "ON" ? "checked" : ""}
      ${disabled ? "disabled" : ""}
    />
    <span class="slider"></span>
  </label>

  <button
    class="cmd-btn"
    data-id="${cmd.id}"
    ${disabled ? "disabled" : ""}
  >
    ${
      uiState === "SUCCESS" || uiState === "FAILED"
        ? "🔁 Execute"
        : "▶ Execute"
    }
  </button>
</div>

    </div>
  `;
}
