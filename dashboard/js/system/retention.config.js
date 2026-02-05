// 🔒 TASK-88A: central retention configuration

export const RETENTION_DAYS = {
  AUDIT: 30,
  RECOVERY: 30
};

export function getRetentionCutoff(days) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}
