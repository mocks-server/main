function scopedAlertsMethods(alertIdScope, originalAddMethod, originalRemoveMethod) {
  return {
    addAlert: (alertId, message, error) => {
      return originalAddMethod(`${alertIdScope}:${alertId || ""}`, message, error);
    },
    removeAlerts: (alertsIdScope) => {
      return originalRemoveMethod(`${alertIdScope}:${alertsIdScope || ""}`);
    },
  };
}

module.exports = {
  scopedAlertsMethods,
};
