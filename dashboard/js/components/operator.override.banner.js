import {
  isOperatorOverrideActive,
  getOperatorOverrideInfo,
  disableOperatorOverride
} from "../system/operator.override.state.js";

function formatRemaining(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

export function OperatorOverrideBanner() {
  if (!isOperatorOverrideActive()) return "";

  const info = getOperatorOverrideInfo();
  const remaining = info.until - Date.now();

  return `
    <div class="operator-override-banner">
      <span>🧑‍💼 Operator Override Active</span>
      <span>⏱ ${formatRemaining(remaining)} remaining</span>
      <span class="reason">(${info.reason})</span>
      <button
        class="override-disable-btn"
        onclick="window.disableOperatorOverride()"
      >
        Disable Override
      </button>
    </div>
  `;
}

// expose for onclick
window.disableOperatorOverride = disableOperatorOverride;
