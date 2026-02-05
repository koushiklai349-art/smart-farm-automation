import { getCurrentUserRole, ROLES } from "./user.role.store.js";

export function canEditPolicy() {
  return getCurrentUserRole() === ROLES.ADMIN;
}

export function canRollbackPolicy() {
  return getCurrentUserRole() === ROLES.ADMIN;
}

export function canOverride() {
  const r = getCurrentUserRole();
  return r === ROLES.OPERATOR || r === ROLES.ADMIN;
}

export function canSimulate() {
  const r = getCurrentUserRole();
  return r === ROLES.OPERATOR || r === ROLES.ADMIN;
}

export function canViewPostMortem() {
  const r = getCurrentUserRole();
  return r === ROLES.OPERATOR || r === ROLES.ADMIN;
}

// 🔔 Alert RBAC helpers

export function canExportAlerts() {
  return getCurrentUserRole() === ROLES.ADMIN;
}

export function canViewAlert(alert) {
  const role = getCurrentUserRole();

  // Admin sees everything
  if (role === ROLES.ADMIN) return true;

  // Operator: hide info-level alerts
  if (role === ROLES.OPERATOR) {
    return alert.severity !== "info";
  }

  // Viewer or others: nothing (future-proof)
  return false;
}

export function canExecutePlaybook(action, risk, role = "operator") {
  const roleMatrix = {
    admin: ["RETRY_DEVICE","QUARANTINE_DEVICE","RELEASE_DEVICE","NOTIFY_OPERATOR","ESCALATE_INCIDENT"],
    operator: ["RETRY_DEVICE","NOTIFY_OPERATOR"],
    viewer: []
  };

  if (!roleMatrix[role]?.includes(action)) {
    return { allowed: false, reason: "ROLE_NOT_ALLOWED" };
  }

  if (risk === "high") {
    return { allowed: false, reason: "HIGH_RISK_REQUIRES_APPROVAL" };
  }

  return { allowed: true };
}
