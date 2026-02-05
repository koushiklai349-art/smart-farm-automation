let consecutiveOk = 0;
let escalationActive = false;

export function recordSLAResult(status) {
  if (status === "ok") {
    consecutiveOk++;

    if (consecutiveOk >= 3) {
      escalationActive = false;
    }
  } else {
    consecutiveOk = 0;
  }
}

export function isEscalationActive() {
  return escalationActive;
}

export function activateEscalation() {
  escalationActive = true;
  consecutiveOk = 0;
}

export function resetSLAState() {
  consecutiveOk = 0;
  escalationActive = false;
}
