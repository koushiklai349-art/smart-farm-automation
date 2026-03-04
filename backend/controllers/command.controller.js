const Command = require("../models/command.model");
const { processCommand } = require("../services/command.orchestrator.service");
const { sendToDevice } = require("../phase-b/integration/device.bridge");
const { normalizePayload } = require("../utils/payload.normalizer");

function cryptoId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

exports.createCommand = async (req, res) => {
  if (
  req.user.role === "OPERATOR" &&
  req.body.source !== "MANUAL"
) {
  return res.status(403).json({
    error: "OPERATOR_CAN_ONLY_SEND_MANUAL_COMMANDS"
  });
}
  try {
    const { deviceId, payload, source } = req.body;

    if (!deviceId || !payload) {
      return res.status(400).json({ error: "INVALID_PAYLOAD" });
    }

    const normalizedPayload = normalizePayload(payload);
    const commandId = cryptoId();
  const userInfo = req.user || {
  username: "SYSTEM",
  role: "SYSTEM"
};
    // 1️⃣ Create DB entry (STRICT INIT)
   const command = await Command.create({
  deviceId,
  commandId,
  payload: normalizedPayload,
  source,
  status: "pending",

  issuedBy: userInfo.username,
issuedByRole: userInfo.role,
  issuedAt: new Date(),
  ipAddress: req.ip
});

    // 2️⃣ Orchestrator check
    const result = await processCommand({
      deviceId,
      commandId,
      payload: normalizedPayload,
      source
    });

    if (result.status !== "ALLOWED") {
      await Command.findOneAndUpdate(
        { commandId },
        { status: "blocked" }
      );

      return res.status(201).json(
        await Command.findOne({ commandId })
      );
    }

    // 3️⃣ Mark allowed
    await Command.findOneAndUpdate(
      { commandId },
      { status: "allowed" }
    );

    // 4️⃣ Dispatch to device (ONLY ONCE)
    await sendToDevice({
      deviceId,
      commandId,
      payload: normalizedPayload
    });

    // 5️⃣ Mark sent (ATOMIC UPDATE)
    await Command.findOneAndUpdate(
      { commandId, status: "allowed" },
      { status: "sent" }
    );

    const finalCommand = await Command.findOne({ commandId });

    res.status(201).json(finalCommand);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommands = async (req, res) => {
  try {
    const commands = await Command.find().sort({ createdAt: -1 });
    res.json(commands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};