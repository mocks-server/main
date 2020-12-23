function scopedAlertsMethods(contextScope, originalAddMethod, originalRemoveMethod) {
  return {
    addAlert: (context, message, error) => {
      return originalAddMethod(`${contextScope}:${context || ""}`, message, error);
    },
    removeAlerts: (context) => {
      return originalRemoveMethod(`${contextScope}:${context || ""}`);
    },
  };
}

module.exports = {
  scopedAlertsMethods,
};
