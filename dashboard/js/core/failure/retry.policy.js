// /core/failure/retry.policy.js

export const DEFAULT_RETRY_POLICY = {
  maxRetry: 3,        // সর্বোচ্চ ৩ বার retry
  baseDelay: 2000,    // ২ সেকেন্ড delay
  strategy: "fixed"   // fixed | exponential
};

export function getRetryDelay(retryCount, policy = DEFAULT_RETRY_POLICY) {
  if (policy.strategy === "exponential") {
    return policy.baseDelay * Math.pow(2, retryCount - 1);
  }
  return policy.baseDelay;
}
