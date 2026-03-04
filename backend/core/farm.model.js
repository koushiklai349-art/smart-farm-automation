// backend/core/farm.model.js

class Farm {
  constructor({
    id,
    name,
    mode = "offline", // offline | hybrid
    location = null,
    createdAt = Date.now(),
    meta = {}
  }) {
    if (!id) throw new Error("Farm.id is required");
    if (!name) throw new Error("Farm.name is required");

    this.id = id;
    this.name = name;
    this.mode = mode;
    this.location = location;
    this.createdAt = createdAt;

    // extensible metadata (future safe)
    this.meta = meta;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      location: this.location,
      createdAt: this.createdAt,
      meta: this.meta
    };
  }
}

module.exports = Farm;
