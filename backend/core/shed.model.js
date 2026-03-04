// backend/core/shed.model.js

const ALLOWED_SHED_TYPES = [
  "physical",
  "logical"
];

class Shed {
  constructor({
    id,
    zoneId,
    name,
    shedType,
    capacity = null,
    description = null,
    createdAt = Date.now(),
    meta = {}
  }) {
    if (!id) throw new Error("Shed.id is required");
    if (!zoneId) throw new Error("Shed.zoneId is required");
    if (!name) throw new Error("Shed.name is required");
    if (!shedType) throw new Error("Shed.shedType is required");

    if (!ALLOWED_SHED_TYPES.includes(shedType)) {
      throw new Error(`Invalid shedType: ${shedType}`);
    }

    this.id = id;
    this.zoneId = zoneId;
    this.name = name;
    this.shedType = shedType; // physical | logical
    this.capacity = capacity;
    this.description = description;
    this.createdAt = createdAt;
    this.meta = meta;
  }

  toJSON() {
    return {
      id: this.id,
      zoneId: this.zoneId,
      name: this.name,
      shedType: this.shedType,
      capacity: this.capacity,
      description: this.description,
      createdAt: this.createdAt,
      meta: this.meta
    };
  }
}

module.exports = Shed;
