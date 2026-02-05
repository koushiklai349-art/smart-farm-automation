import { notifyUI, subscribe } from "./store/store.notifier.js";



export const store = {
  animals: {
    cow: 12,
    goat: 18,
    poultry: 240,
    fish: 1200
  },
  feedStatus: "ok",
  power: "solar",

  alerts: [
    { id: 1, type: "critical", message: "Water level low in Fish Pond", time: "10:12 AM" },
    { id: 2, type: "warning", message: "Feed stock running low", time: "09:40 AM" }
  ],

  logs: [
    { time: "10:15 AM", source: "Fish Sensor", message: "Water level = 22%" },
    { time: "10:12 AM", source: "System", message: "Critical alert generated" },
    { time: "09:50 AM", source: "Automation", message: "Feed motor stopped" }
  ],

  metrics: {
  temperature: null,
  humidity: null,
  soil_moisture: null,
  source: null
  },


  failures: [
    {
      id: "F-001",
      module: "Fish Pond",
      component: "Water Pump",
      reason: "No response from relay",
      status: "failed" // failed | retrying | recovered
    }
  ],
  
  schedules: [
    {
      id: "S-001",
      name: "Morning Fish Feed",
      module: "Fish Pond",
      action: "Feed ON",
      time: "06:30",
      enabled: true
    },
    {
      id: "S-002",
      name: "Cow Water Pump",
      module: "Cow Shed",
      action: "Pump ON",
      time: "17:00",
      enabled: false
    }
  ],
  commands: [
  {
    id: "C-001",
    name: "Feed Fish NOW",
    module: "Fish Pond",
    target: "feeder",
    action: "START",
    status: "idle"
  },
  {
    id: "C-002",
    name: "Pump ON (Cow Shed)",
    module: "Cow Shed",
    target: "pump",
    action: "ON",
    status: "idle"
  },
  {
    id: "C-003",
    name: "Pump OFF (Cow Shed)",
    module: "Cow Shed",
    target: "pump",
    action: "OFF",
    status: "idle"
  }
],

 system: {
  health: "critical",
  power: "solar",
  network: "online",
  lastUpdate: Date.now()
 }

};
// store.js
store.subscribe = subscribe;
store.notify = notifyUI;

