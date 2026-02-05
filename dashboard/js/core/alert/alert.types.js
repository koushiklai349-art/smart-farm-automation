// /core/alert/alert.types.js

// Severity Levels
export const ALERT_SEVERITY = {
  INFO: "info",         // শুধু জানানো
  WARNING: "warning",   // attention দরকার
  CRITICAL: "critical"  // immediate action দরকার
};

// Alert Types with default severity
export const ALERT_TYPES = {
  DEVICE_OFFLINE: {
    code: "DEVICE_OFFLINE",
    severity: ALERT_SEVERITY.WARNING,
    message: "Device went offline"
  },

  COMMAND_RETRYING: {
    code: "COMMAND_RETRYING",
    severity: ALERT_SEVERITY.WARNING,
    message: "Command retry in progress"
  },

  COMMAND_HARD_FAIL: {
    code: "COMMAND_HARD_FAIL",
    severity: ALERT_SEVERITY.CRITICAL,
    message: "Command failed permanently"
  },
   
    ENGINE_HEARTBEAT_MISSED: {
    code: "ENGINE_HEARTBEAT_MISSED",
    severity: "critical",
    message: "Engine heartbeat missed"
  },
  SAFE_STATE_APPLIED: {
    code: "SAFE_STATE_APPLIED",
    severity: ALERT_SEVERITY.CRITICAL,
    message: "Safe state applied to device"
  },

  DEVICE_RECOVERED: {
    code: "DEVICE_RECOVERED",
    severity: ALERT_SEVERITY.INFO,
    message: "Device recovered and online"
  }
};
