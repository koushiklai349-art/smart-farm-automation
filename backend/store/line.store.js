const lines = {}; 
// lineId → { controllers: [], primary: null }

function assignLine(lineId, controllerId) {

  lines[lineId] = lines[lineId] || {
    controllers: [],
    primary: null
  };

  if (!lines[lineId].controllers.includes(controllerId)) {
    lines[lineId].controllers.push(controllerId);
  }

  // First assigned becomes primary
  if (!lines[lineId].primary) {
    lines[lineId].primary = controllerId;
  }
}

function getControllersForLine(lineId) {
  return lines[lineId]?.controllers || [];
}

function getPrimaryController(lineId) {
  return lines[lineId]?.primary || null;
}

function setPrimaryController(lineId, controllerId) {
  if (!lines[lineId]) return;
  if (!lines[lineId].controllers.includes(controllerId)) return;

  lines[lineId].primary = controllerId;
}

module.exports = {
  assignLine,
  getControllersForLine,
  getPrimaryController,
  setPrimaryController
};