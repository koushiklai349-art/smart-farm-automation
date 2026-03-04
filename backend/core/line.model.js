// backend/core/line.model.js

class Line {
  constructor({
    id,
    shedId,
    name,
    unitType,
    controllerClassId,
    description = null,
    createdAt = Date.now(),
    meta = {}
  }) {
    if (!id) throw new Error("Line.id is required");
    if (!shedId) throw new Error("Line.shedId is required");
    if (!name) throw new Error("Line.name is required");
    if (!unitType) throw new Error("Line.unitType is required");
    if (!controllerClassId) {
      throw new Error("Line.controllerClassId is required");
    }

    this.id = id;
    this.shedId = shedId;
    this.name = name;
    this.unitType = unitType; // feed | water | climate | manure | custom
    this.controllerClassId = controllerClassId;

    this.description = description;
    this.createdAt = createdAt;
    this.meta = meta;
  }

  toJSON() {
    return {
      id: this.id,
      shedId: this.shedId,
      name: this.name,
      unitType: this.unitType,
      controllerClassId: this.controllerClassId,
      description: this.description,
      createdAt: this.createdAt,
      meta: this.meta
    };
  }
}

module.exports = Line;
