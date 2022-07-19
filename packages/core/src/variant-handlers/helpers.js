function isVersion4(Handler) {
  return Handler.version === "4";
}

function getDataFromVariant(variant, Handler) {
  if (isVersion4(Handler)) {
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
