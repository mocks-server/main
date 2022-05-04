const { compact } = require("lodash");
const fsExtra = require("fs-extra");
const path = require("path");

const CliRunner = require("./CliRunner");

const JS_EXTENSION = ".js";
const INDEX_JS = `index${JS_EXTENSION}`;
const LOG_OPTION_START = "[-->";
const LOG_OPTION_END = "<--]";
const FIXTURES_PATH = path.resolve(__dirname, "..", "fixtures");

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

function logScope(scopes) {
  return compact(scopes).join(".");
}

function logConfig(config) {
  config._groups.forEach((group) => {
    group._namespaces.forEach((namespace) => {
      namespace._options.forEach((option) => {
        const valueType = typeof option.value;
        console.log(
          `${LOG_OPTION_START}${logScope([
            group.name,
            namespace.name,
            option.name,
          ])}:${valueType}:${
            valueType === "object" ? JSON.stringify(option.value) : option.value
          }${LOG_OPTION_END}`
        );
      });
    });
  });
}

function optionsFromLogs(joinedLogs) {
  const matches = joinedLogs.match(/\[\-\->(.*)<\-\-\]/gim) || [];
  return matches.map((option) => option.replace(LOG_OPTION_START, "").replace(LOG_OPTION_END, ""));
}

module.exports = {
  fixtureFolder,
  fixtureRunner,
  logConfig,
  optionsFromLogs,
};
