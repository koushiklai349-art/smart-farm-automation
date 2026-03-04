const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "controllers.json");

function read() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  getAll() {
    return read();
  },

  getById(id) {
    return read().find(c => c.id === id);
  },

  getByDeviceId(deviceId) {
    return read().find(c => c.deviceId === deviceId);
  },

  create(controller) {
    const data = read();
    data.push(controller);
    write(data);
    return controller;
  },

  update(id, patch) {
    const data = read();
    const index = data.findIndex(c => c.id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...patch };
    write(data);
    return data[index];
  }
};
