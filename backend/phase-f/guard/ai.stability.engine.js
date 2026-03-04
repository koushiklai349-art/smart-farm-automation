const { runtime } = require("../../store/runtime.store");

function evaluateAIStability() {

  let score = 100;

  const health =
    runtime.systemHealth?.score || 100;

  // 1️⃣ System health impact
  score -= (100 - health) * 0.4;

  // 2️⃣ Drift pressure
  const history =
    runtime.arbitrationHistory || [];

  if (history.length > 20) {

    const recent = history.slice(-20);
    const count = {};

    recent.forEach(entry => {
      const reason = entry.winner?.reason;
      if (!reason) return;
      count[reason] =
        (count[reason] || 0) + 1;
    });

    const maxDominance =
      Math.max(...Object.values(count)) / 20;

    if (maxDominance > 0.8)
      score -= 20;
  }

  // 3️⃣ Trust imbalance
  const trust =
    runtime.trustIndex?.reasons || {};

  const trustValues =
    Object.values(trust).map(t => t.score);

  if (trustValues.length > 0) {

    const avgTrust =
      trustValues.reduce((a,b)=>a+b,0)
      / trustValues.length;

    if (avgTrust < 40)
      score -= 15;
  }

  // 4️⃣ Energy pressure
  if (runtime.energy?.todayUsage >
      runtime.energy?.dailyLimit) {
    score -= 15;
  }

  // 5️⃣ Alert overload
  if ((runtime.alerts?.length || 0) > 400) {
    score -= 10;
  }

  score = Math.max(0, Math.round(score));

  runtime.aiStability = {
    score,
    evaluatedAt: Date.now()
  };

  console.log("🧠 AI STABILITY SCORE:", score);

  return score;
}

module.exports = {
  evaluateAIStability
};