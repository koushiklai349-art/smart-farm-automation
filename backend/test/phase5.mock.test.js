// backend/test/phase5.mock.test.js

const deviceIdentity =
  require("../phase-d/identity/device.identity.service.js");

// TRUST DEVICE VIA SERVICE
deviceIdentity.trustDevice("ESP32-MOCK-1");

const controllerRegistryService =
  require("../services/controller.registry.service");
const controllerAssignmentService =
  require("../services/controller.assignment.service");
const heartbeatService =
  require("../services/heartbeat.service");

const { dispatchCommand } =
  require("../phase-b/dispatch/command.dispatcher");

// ---------- STEP 1: Register ----------
console.log("\n[TEST] Register controller");

controllerRegistryService.register({
  instanceId: "ESP32-MOCK-1",
  controllerClassId: "poultry_feedline_v1",
  hardwareUid: "HW-MOCK-001"
});

// ---------- STEP 2: Assign ----------
console.log("[TEST] Assign to line");

controllerAssignmentService.assignToLine({
  controllerInstanceId: "ESP32-MOCK-1",
  lineId: "LINE-1"
});

// ---------- STEP 3: Heartbeat ----------
console.log("[TEST] Heartbeat");

heartbeatService.recordHeartbeat("ESP32-MOCK-1");

// ---------- STEP 4: Dispatch (LINE-CENTRIC) ----------
console.log("[TEST] Dispatch command");

dispatchCommand({
  lineId: "LINE-1",
  commandId: "CMD-MOCK-001",
  action: "START_FEED"
})
  .then((res) => {
    console.log("[TEST RESULT]", res);
  })
  .catch((err) => {
    console.error("[TEST ERROR]", err.message);
  });
