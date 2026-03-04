// backend/core/zone.model.js

const ALLOWED_ZONE_TYPES = [
  "poultry",
  "dairy",
  "feed",
  "waste",
  "custom"
];

class Zone {
  constructor({
    id,
    farmId,
    name,
    zoneType,
    description = null,
    createdAt = Date.now(),
    meta = {}
  }) {
    if (!id) throw new Error("Zone.id is required");
    if (!farmId) throw new Error("Zone.farmId is required");
    if (!name) throw new Error("Zone.name is required");
    if (!zoneType) throw new Error("Zone.zoneType is required");

    if (!ALLOWED_ZONE_TYPES.includes(zoneType)) {
      throw new Error(`Invalid zoneType: ${zoneType}`);
    }

    this.id = id;
    this.farmId = farmId;
    this.name = name;
    this.zoneType = zoneType;
    this.description = description;
    this.createdAt = createdAt;
    this.meta = meta;
  }

  toJSON() {
    return {
      id: this.id,
      farmId: this.farmId,
      name: this.name,
      zoneType: this.zoneType,
      description: this.description,
      createdAt: this.createdAt,
      meta: this.meta
    };
  }
}

module.exports = Zone;
