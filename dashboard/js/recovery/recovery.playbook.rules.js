// dashboard/js/recovery/recovery.playbook.rules.js

export const PLAYBOOK_ACTIONS = {
  RETRY_DEVICE: "RETRY_DEVICE",
  QUARANTINE_DEVICE: "QUARANTINE_DEVICE",
  RELEASE_DEVICE: "RELEASE_DEVICE",
  NOTIFY_OPERATOR: "NOTIFY_OPERATOR",
  ESCALATE_INCIDENT: "ESCALATE_INCIDENT"
};

export const PLAYBOOK_RULES = [
  // 🔁 Retry if still open and retry count is low
  {
    id: "retry-open-incident",
    when: incident =>
      incident.status === "OPEN" &&
      (incident.retryCount || 0) < 3,
    actions: [PLAYBOOK_ACTIONS.RETRY_DEVICE],
    risk: "low"
  },

  // 🧊 Quarantine if retries exhausted
  {
    id: "quarantine-after-retries",
    when: incident =>
      (incident.retryCount || 0) >= 3 &&
      incident.status !== "QUARANTINED",
    actions: [PLAYBOOK_ACTIONS.QUARANTINE_DEVICE],
    risk: "medium"
  },

  // 🔓 Release if manual release possible
  {
    id: "manual-release",
    when: incident =>
      incident.status === "MANUAL_RELEASE",
    actions: [PLAYBOOK_ACTIONS.RELEASE_DEVICE],
    risk: "low"
  },

  // 🚨 Notify operator on critical severity
  {
    id: "notify-on-critical",
    when: incident =>
      incident.severity === "CRITICAL",
    actions: [PLAYBOOK_ACTIONS.NOTIFY_OPERATOR],
    risk: "low"
  },

  // ⬆️ Escalate long-running incidents
  {
    id: "escalate-long-open",
    when: incident =>
      incident.status === "OPEN" &&
      incident.durationMs != null &&
      incident.durationMs > 5 * 60 * 1000, // 5 min
    actions: [PLAYBOOK_ACTIONS.ESCALATE_INCIDENT],
    risk: "medium"
  }
];
