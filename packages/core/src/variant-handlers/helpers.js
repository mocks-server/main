function getDataFromVariant(variant) {
  return variant.options;
}

function getPreview(variantInstance) {
  return variantInstance.preview;
}

module.exports = {
  getDataFromVariant,
  getPreview,
};
