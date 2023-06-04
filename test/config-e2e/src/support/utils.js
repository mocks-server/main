const { compact } = require("lodash");
const fsExtra = require("fs-extra");
const path = require("path");

const CliRunner = require("@mocks-server/cli-runner");

const JS_EXTENSION = ".js";
const INDEX_JS = `index${JS_EXTENSION}`;
const LOG_OPTION_START = "[-->";
const LOG_OPTION_END = "<--]";
const FIXTURES_PATH = path.resolve(__dirname, "..", "fixtures");
const TYPE_ARRAY = "array";
const TYPE_OBJECT = "object";

function jsFile(name) {
  return `${name}${JS_EXTENSION}`;
}

function fixtureFolder(name) {
  return path.resolve(FIXTURES_PATH, name);
}

function indexFileOrigin(name) {
  return path.resolve(FIXTURES_PATH, jsFile(name));
}

function fixtureRunner(name, indexName, options = {}) {
  const fixturePath = fixtureFolder(name);
  fsExtra.copySync(indexFileOrigin(indexName), path.resolve(fixturePath, INDEX_JS));
  return new CliRunner(["node", `./${INDEX_JS}`, ...(options.args || [])], {
    cwd: fixturePath,
    ...options,
  });
}

function logScope(namespace, optionName) {
  const namespaceName = namespace.name;
  const isRoot = namespace.isRoot;
  const parentNamespaces = namespace.parents.map((parent) => parent.name);
  return compact([...parentNamespaces, isRoot ? undefined : namespaceName, optionName]).join(".");
}

function getValueType(option) {
  if (option.type === TYPE_ARRAY) {
    return TYPE_ARRAY;
  }
  return typeof option.value;
}

function parseValue(valueType, value) {
  if (valueType === TYPE_OBJECT || valueType === TYPE_ARRAY) {
    return JSON.stringify(value);
  }
  return value;
}

function logNamespace(namespace) {
  namespace.options.forEach((option) => {
    const valueType = getValueType(option);
    // eslint-disable-next-line no-console
    console.log(
      `${LOG_OPTION_START}${logScope(namespace, option.name)}:${option.type}:${parseValue(
        valueType,
        option.value
      )}${LOG_OPTION_END}`
    );
  });
  logNamespaces(namespace.namespaces);
}

function logNamespaces(namespaces) {
  namespaces.forEach(logNamespace);
}

function logConfig(config) {
  logNamespaces(config._namespaces);
}

function optionsFromLogs(joinedLogs) {
  // eslint-disable-next-line no-useless-escape
  const matches = joinedLogs.match(/\[\-\->(.*)<\-\-\]/gim) || [];
  return matches.map((option) => option.replace(LOG_OPTION_START, "").replace(LOG_OPTION_END, ""));
}

module.exports = {
  fixtureFolder,
  fixtureRunner,
  logConfig,
  optionsFromLogs,
};
