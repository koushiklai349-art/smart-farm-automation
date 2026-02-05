// js/prediction/prediction.rules.js

export const PREDICTION_RULES = {
  STABILITY_DROP: {
    threshold: 15,     // drop in last window
    windowMin: 10,     // minutes
    risk: "MEDIUM",
  },

  FREQUENT_INCIDENT: {
    count: 3,
    windowMin: 30,
    risk: "HIGH",
  },
};
