// backend/store/rule.store.js

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/rules.json");

let rules = [];

// Load from file
function loadRules() {
  try {
    const raw = fs.readFileSync(filePath);
    rules = JSON.parse(raw);
  } catch (err) {
    rules = [];
  }
}

// Save to file
function saveRules() {
  fs.writeFileSync(filePath, JSON.stringify(rules, null, 2));
}

function getRules() {
  return rules;
}

function getRulesForDevice(deviceId) {
  return rules.filter(r => r.deviceId === deviceId);
}

function getRulesForLine(lineId) {
  return rules.filter(r => r.lineId === lineId);
}

function getFarmRules() {
  return rules.filter(r => r.farmId && r.enabled !== false);
}

function addRule(rule) {

  rule.createdAt = new Date().toISOString();
  rule.lastTriggeredAt = null;
  rule.cooldownMs = rule.cooldownMs || 30000;
  rule.autoTune = Boolean(rule.autoTune);
  rules.push(rule);
  saveRules();
  return rule;
}

function toggleRule(ruleId, enabled) {
  const rule = rules.find(r => r.ruleId === ruleId);
  if (!rule) return null;
  rule.enabled = enabled;
  saveRules();
  return rule;
}

loadRules();

module.exports = {
  getRules,
  getRulesForDevice,
  getRulesForLine,
  addRule,
  getFarmRules,
  toggleRule
};