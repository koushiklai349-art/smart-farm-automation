/**
 * Trust level based on confidence weight
 */
export const TRUST_SUPPRESS_THRESHOLD = 30;

export function getPlaybookTrustLevel(weight) {
  if (weight >= 75) {
    return {
      level: "trusted",
      label: "Trusted",
      icon: "🟢"
    };
  }

  if (weight >= 40) {
    return {
      level: "neutral",
      label: "Neutral",
      icon: "🟡"
    };
  }

  return {
    level: "risky",
    label: "Risky",
    icon: "🔴"
  };
}
