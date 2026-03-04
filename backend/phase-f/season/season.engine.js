const { runtime } = require("../../store/runtime.store");

function evaluateSeason() {

  const telemetry = runtime.telemetry || {};
  const allTemps = [];
  const allHumidity = [];

  Object.values(telemetry).forEach(d => {
    if (d.sensors?.temperature !== undefined)
      allTemps.push(d.sensors.temperature);

    if (d.sensors?.humidity !== undefined)
      allHumidity.push(d.sensors.humidity);
  });

  if (!allTemps.length) return;

  const avgTemp =
    allTemps.reduce((a, b) => a + b, 0) / allTemps.length;

  const avgHumidity =
    allHumidity.length
      ? allHumidity.reduce((a, b) => a + b, 0) / allHumidity.length
      : 0;

  let season = "NORMAL";

  if (avgTemp > 35) season = "SUMMER";
  else if (avgTemp < 15) season = "WINTER";
  else if (avgHumidity > 80) season = "HUMID";

  runtime.season.current = season;
  runtime.season.lastEvaluated = new Date().toISOString();

  console.log("[SEASON MODE]", season);
}

module.exports = {
  evaluateSeason
};