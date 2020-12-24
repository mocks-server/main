const { isFunction } = require("lodash");

function alertContext(contextScope, context) {
  return `${contextScope}:${context || ""}`;
}

/*
When registering plugins, their displayName is not still available, so its index is used as context.
Afterwards it may change, so old alerts have to be renamed
*/
function mutableScopedAlertsMethods(
  contextScopeCallback,
  originalAddMethod,
  originalRemoveMethod,
  originalRenameMethod
) {
  let previousContext;
  const replacePreviousContextAlerts = (contextScope) => {
    if (!previousContext) {
      previousContext = contextScope;
      return;
    }
    if (previousContext !== contextScope) {
      originalRenameMethod(`${previousContext}:`, `${contextScope}:`);
      previousContext = contextScope;
    }
  };

  return {
    addAlert: (context, message, error) => {
      const contextScope = contextScopeCallback();
      replacePreviousContextAlerts(contextScope);
      return originalAddMethod(alertContext(contextScope, context), message, error);
    },
    removeAlerts: (context) => {
      const contextScope = contextScopeCallback();
      replacePreviousContextAlerts(contextScope);
      return originalRemoveMethod(alertContext(contextScope, context));
    },
  };
}

function scopedAlertsMethods(
  contextScope,
  originalAddMethod,
  originalRemoveMethod,
  originalRenameMethod
) {
  if (isFunction(contextScope)) {
    return mutableScopedAlertsMethods(
      contextScope,
      originalAddMethod,
      originalRemoveMethod,
      originalRenameMethod
    );
  }
  return {
    addAlert: (context, message, error) => {
      return originalAddMethod(alertContext(contextScope, context), message, error);
    },
    removeAlerts: (context) => {
      return originalRemoveMethod(alertContext(contextScope, context));
    },
    ...(originalRenameMethod && {
      renameAlerts: (oldContext, newContext) => {
        return originalRenameMethod(
          alertContext(contextScope, oldContext),
          alertContext(contextScope, newContext)
        );
      },
    }),
  };
}

module.exports = {
  scopedAlertsMethods,
};
