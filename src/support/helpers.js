/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

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

function addEventListener(listener, eventName, eventEmitter) {
  const removeCallback = () => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}

module.exports = {
  scopedAlertsMethods,
  addEventListener,
};
