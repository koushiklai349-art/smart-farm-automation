// backend/core/controllerClass.model.js

class ControllerClass {
  constructor({
    id,
    name,
    unitType,
    supportedCommands = [],
    safetyLimits = {},
    capabilities = {},
    createdAt = Date.now(),
    meta = {}
  }) {
    if (!id) throw new Error("ControllerClass.id is required");
    if (!name) throw new Error("ControllerClass.name is required");
    if (!unitType) throw new Error("ControllerClass.unitType is required");

    if (!Array.isArray(supportedCommands)) {
      throw new Error("ControllerClass.supportedCommands must be an array");
    }

    this.id = id;
    this.name = name; // e.g. poultry_feedline_v1
    this.unitType = unitType; // feed | water | climate | manure

    this.supportedCommands = supportedCommands;
    this.safetyLimits = safetyLimits;
    this.capabilities = capabilities;

    this.createdAt = createdAt;
    this.meta = meta;
  }

  supportsCommand(commandType) {
    return this.supportedCommands.includes(commandType);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      unitType: this.unitType,
      supportedCommands: this.supportedCommands,
      safetyLimits: this.safetyLimits,
      capabilities: this.capabilities,
      createdAt: this.createdAt,
      meta: this.meta
    };
  }
}

module.exports = ControllerClass;
