// simple in-memory pub/sub
const subs = {};

exports.subscribe = (topic, fn) => {
  subs[topic] = subs[topic] || [];
  subs[topic].push(fn);
};

exports.publish = (topic, payload) => {
  (subs[topic] || []).forEach(fn => fn(payload));
};
