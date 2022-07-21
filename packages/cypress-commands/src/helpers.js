const ENABLED_ENVIRONMENT_VAR = "MOCKS_SERVER_ENABLED";
const ADMIN_API_HOST_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_HOST";
const ADMIN_API_PORT_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_PORT";

const FALSY_VALUES = [false, "false", 0, "0"];

function valueIsOneOf(value, arrayOfValues) {
  return arrayOfValues.includes(value);
}

function isFalsy(value) {
  return valueIsOneOf(value, FALSY_VALUES);
}

module.exports = {
  ENABLED_ENVIRONMENT_VAR,
  ADMIN_API_HOST_ENVIRONMENT_VAR,
  ADMIN_API_PORT_ENVIRONMENT_VAR,
  isFalsy,
};
