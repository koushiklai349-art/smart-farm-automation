const { runtime } = require("../../store/runtime.store");

function getFarmAggregate() {

  const devices = Object.values(runtime.telemetry || {});
  if (!devices.length) return null;

  let tempSum = 0;
  let humSum = 0;
  let soilSum = 0;
  let count = 0;

  devices.forEach(d => {
    if (!d?.sensors) return;

    if (typeof d.sensors.temperature === "number") {
      tempSum += d.sensors.temperature;
    }

    if (typeof d.sensors.humidity === "number") {
      humSum += d.sensors.humidity;
    }

    if (typeof d.sensors.soil_moisture === "number") {
      soilSum += d.sensors.soil_moisture;
    }

    count++;
  });

  if (!count) return null;

  return {
    temperature: tempSum / count,
    humidity: humSum / count,
    soil_moisture: soilSum / count
  };
}

module.exports = {
  getFarmAggregate
};