function getOptionParser(optionDetails) {
  if (optionDetails.parse) {
    return optionDetails.parse;
  }
  if (optionDetails.type === "number") {
    return parseInt;
  }
}

module.exports = {
  getOptionParser,
};
