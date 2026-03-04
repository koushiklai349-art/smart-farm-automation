// Memory-only runtime state (NO fs writes)
const runtime = {
  devices: {},          // status, lastSeen
  sensorData: {},       // live telemetry
  commandQueue: {},     // pending/sent commands
  commandCooldown: {}, // deviceId → timestamp
  actuatorState: {},
  flipProtection: {},
  
  maintenance: {
  enabled: false,
  reason: null,
  activatedAt: null
},
  selfOptimization: {
  enabled: true,
  volatilityThreshold: 10,
  cooldownMin: 5000,
  cooldownMax: 30000
},
  strategy: {
  mode: "BALANCED",
  lastChanged: null
},
  selfHealing: {
  decayFactor: 0.95,
  neutralZone: 2
},
  trustIndex: {
  reasons: {
    // reason: { score, lastUpdated }
  }
},
  metaLearning: {
  learningRate: 0.5,
  minRate: 0.1,
  maxRate: 2,
  stabilityScore: 100
},
  aiGuard: {
  maxWeight: 20,
  minWeight: -20,
  driftThreshold: 30
},
  swarmMemory: {
  reasonPerformance: {
    // reason: { success: number, failure: number }
  }
},
  behaviourMemory: {
  decisions: []   // { reason, action, beforeTemp, afterTemp }
},
  digitalTwin: {
  enabled: false,
  shadowState: {},
  simulationHistory: []
},
  explainability: {
  history: []
},
  incidents: {
  history: [],
  lastId: 0
},
  simulation: {
  enabled: false,
  lastScenario: null,
  results: []
},
  energy: {
  dailyLimit: 1000,     // abstract energy units
  todayUsage: 0,
  lastReset: null
},
  season: {
  current: "NORMAL",  // NORMAL | SUMMER | WINTER | HUMID
  lastEvaluated: null
},
  aiMode: {
  enabled: true
},
learning: {
  thresholds: {
    fanTempLow: 25,
    pumpSoilHigh: 70
  }
},
  optimization: {
  devices: {},   // deviceId → { energyScore, waterScore }
  farm: {
    energyScore: 100,
    waterScore: 100
  }
},
  health: {
  devices: {},   // deviceId → score
  farmScore: 100
},
predictive: {
  devices: {}
},
escalation: {
  devices: {}  // deviceId → { level, lastEscalatedAt }
},
maintenance: {
  devices: {}  // deviceId → { recommended: boolean, reason, at }
},
alerts: [],
  metrics: {
    commandsSent: 0,
    commandsSuccess: 0,
    commandsFailed: 0,
    devicesOnline: 0,
    devicesOffline: 0
  },
  caches: {
    behaviourCache: {},
    analytics: {
      temperatureHistory: {},
      waterHistory: {},
      sensorHistory: {},
      historical: {
      telemetry: {},   
      health: {},      
      risk: {}        
     },
     ranking: {
     deviceReliability: {},  // deviceId → score (0-100)
     farmEfficiency: 100
     }
    }
  }
};

runtime.farms = runtime.farms || {};

runtime.globalAI = runtime.globalAI || {
  knowledgePool: {},
  performanceIndex: {},
  lastSync: null
};

runtime.lockedDevices = runtime.lockedDevices || {};

function ensureFarmScope(farmId) {
  runtime.farms[farmId] = runtime.farms[farmId] || {
    lockedDevices: {},
    health: { devices: {} },
    risk: {},
    escalation: {}
  };

  return runtime.farms[farmId];
}

module.exports = {
  runtime,
  ensureFarmScope
};