"use strict";

const stringToBoolean = val => {
  if (val === "true") {
    return true;
  } else if (val === "false") {
    return false;
  }
  throw new Error("Invalid boolean value");
};

module.exports = {
  stringToBoolean
};
