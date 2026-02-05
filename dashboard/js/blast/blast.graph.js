// js/blast/blast.graph.js

export const BLAST_GRAPH = {
  "esp32-fish-01": {
    affects: ["FishPond", "WaterQualityMonitor"],
    severity: "CRITICAL",
  },

  "esp32-cow-01": {
    affects: ["CowShed", "WaterTrough"],
    severity: "MEDIUM",
  },

  "esp32-goat-01": {
    affects: ["GoatShed"],
    severity: "LOW",
  },

  // capability based (fallback)
  "WATER_PUMP": {
    affects: ["IrrigationSystem"],
    severity: "HIGH",
  },
};
