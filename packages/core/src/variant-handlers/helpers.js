function getDataFromVariant(variant) {
  return variant.options;
}

function getPreview(variantInstance) {
  return variantInstance.plainResponsePreview;
}

module.exports = {
  getDataFromVariant,
  getPreview,
};
