const { addRule, getRules } =
  require("../store/rule.store");

exports.createRule = (req, res) => {
  const rule = addRule(req.body);
  res.json(rule);
};

exports.getAllRules = (req, res) => {
  res.json(getRules());
};