#include "../protocol/command_parser.h"
#include "../protocol/ack_builder.h"
#include "../protocol/error_codes.h"

String lastCommandId = "";

String buildError(String code) {
  return String("{\"errorCode\":\"") + code + "\"}";
}

bool executeHardwareAction(String action, int durationSec) {
  if (action == "PUMP_ON") {
    // digitalWrite(PUMP_PIN, HIGH);
    delay(durationSec * 1000);
    // digitalWrite(PUMP_PIN, LOW);
    return true;
  }

  if (action == "PUMP_OFF") {
    // digitalWrite(PUMP_PIN, LOW);
    return true;
  }

  return false;
}

void handleIncomingCommand(DeviceCommand cmd) {
  if (cmd.commandId == lastCommandId) {
    return; // ignore duplicate
  }

  lastCommandId = cmd.commandId;

  bool ok = executeHardwareAction(cmd.action, cmd.durationSec);

  if (ok) {
    DeviceAck ack = buildAck(cmd);
    // publish ACK
  } else {
    // publish ERROR
  }
}

DeviceAck buildAck(DeviceCommand cmd) {
  DeviceAck ack;
  ack.commandId = cmd.commandId;
  ack.deviceId  = cmd.deviceId;
  ack.status    = "SUCCESS";
  return ack;
}
