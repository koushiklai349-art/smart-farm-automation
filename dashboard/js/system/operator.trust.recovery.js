let lastRecoveryAt = 0;
const RECOVERY_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h

export function canApplyTrustRecovery() {
  return Date.now() - lastRecoveryAt >= RECOVERY_INTERVAL_MS;
}

export function markTrustRecovered() {
  lastRecoveryAt = Date.now();
}
