function trigger(context, error) {
  console.warn("[RECOVERY] Triggered", {
    context,
    error: error?.message || error
  });
}

module.exports = {
  recoveryEngine: {
    trigger
  }
};
