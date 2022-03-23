const ENABLED_ENVIRONMENT_VAR = "MOCKS_SERVER_ENABLED";
const BASE_URL_ENVIRONMENT_VAR = "MOCKS_SERVER_BASE_URL";
const ADMIN_API_PATH_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_PATH";

const FALSY_VALUES = [false, "false", 0, "0"];

function valueIsOneOf(value, arrayOfValues) {
  return arrayOfValues.includes(value);
}

function isFalsy(value) {
  return valueIsOneOf(value, FALSY_VALUES);
}

module.exports = {
  ENABLED_ENVIRONMENT_VAR,
  BASE_URL_ENVIRONMENT_VAR,
  ADMIN_API_PATH_ENVIRONMENT_VAR,
  isFalsy,
};
