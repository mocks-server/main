const { docsUrl } = require("../common/helpers");

function isVersion4(Handler) {
  return Handler.version === "4";
}

function getDataFromVariant(variant, Handler, alerts) {
  if (alerts && Handler.deprecated) {
    alerts.set(
      Handler.id,
      `Handler '${
        Handler.id
      }' is deprecated and will be removed in next major version. Consider using another handler. ${docsUrl(
        "releases/migrating-from-v3#route-variants-handlers"
      )}`
    );
  }

  if (isVersion4(Handler)) {
    if (alerts && variant.response) {
      alerts.set(
        "response",
        `'response' property in variants is deprecated and will be removed in next major version. Use 'options' instead.`
      );
    }

    // LEGACY, deprecate "response"
    return variant.options || variant.response;
  }
  return variant;
}

function getPreview(variantInstance) {
  if (isVersion4(variantInstance.constructor)) {
    return variantInstance.preview;
  }
  return variantInstance.plainResponsePreview;
}

module.exports = {
  isVersion4,
  getDataFromVariant,
  getPreview,
};
