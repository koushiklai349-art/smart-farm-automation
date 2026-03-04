#include "./protocol/command_parser.h"
#include "./services/command_executor.cpp"
#include "../phase-d/crypto/command_verify.h"

const String DEVICE_SECRET = "DEVICE_SECRET_HERE";
bool DEVICE_ACTIVE = true;

void handleIncomingCommand(DeviceCommand cmd) {

  // 1️⃣ Verify signature FIRST
  bool valid = verifyCommandSignature(
    cmd.commandId,
    cmd.deviceId,
    cmd.action,
    cmd.issuedAt,
    cmd.signature,
    DEVICE_SECRET
  );

  // ❌ Invalid signature → DROP immediately
  if (!valid) {
    // optional: publish SECURITY_ERROR
    // String err = buildError("SECURITY_ERROR");
    return;
  }
  
  if (!DEVICE_ACTIVE) {
  return;
  }

  // 2️⃣ Idempotency guard (already added earlier)
  if (cmd.commandId == lastCommandId) {
    return;
  }
  lastCommandId = cmd.commandId;

  // 3️⃣ Execute hardware
  bool ok = executeHardwareAction(cmd.action, cmd.durationSec);

  // 4️⃣ Respond
  if (ok) {
    DeviceAck ack = buildAck(cmd);
    // publish ACK via MQTT
  } else {
    String err = buildError(ERR_EXEC_FAIL);
    // publish ERROR via MQTT
  }
}
