const bus = require("./mqtt.mock.bus");

function startMockDevice(deviceId) {

  bus.subscribe(`cmd/${deviceId}`, (cmd) => {

    setTimeout(() => {

      const ackPayload = {
        commandId: cmd.commandId,
        deviceId,
        status: "SUCCESS",
        executedAt: new Date().toISOString()
      };

      console.log("[MOCK DEVICE] ACK →", `ack/${deviceId}`, ackPayload);

      bus.publish(`ack/${deviceId}`, ackPayload);

    }, 300);

  });

}

module.exports = {
  startMockDevice
};