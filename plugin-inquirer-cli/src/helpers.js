/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { trim } = require("lodash");
const emoji = require("node-emoji");
const chalk = require("chalk");

const CLRS = "\x1Bc";
const SECTION_SEP = new Array(60).fill("─").join("");
const HEADERS_STATUS_COLORS = ["green", "yellow", "red"];
const ALERTS_TAB_LINE = `\n${new Array(9).fill(" ").join("")}`;
const LOGS_MODE_MESSAGE = "Displaying logs. Press any key to display main menu again";

const renderWithStatusColor = (message, statusLevel = 0) => {
  return chalk[HEADERS_STATUS_COLORS[statusLevel]](message);
};

const formatError = (error) => {
  return `${error.message}${ALERTS_TAB_LINE}${trim(
    error.stack.split("\n").slice(0, 3).join("\n").replace(/\n/gim, ALERTS_TAB_LINE)
  )}...`;
};

function renderSectionHeader(sectionName) {
  console.log(chalk.grey(SECTION_SEP));
  console.log(emoji.emojify(sectionName));
  console.log(chalk.grey(SECTION_SEP));
}

function renderSectionFooter() {
  console.log("");
}

function renderHeader(description, message, status) {
  return `${chalk.bold("‧")} ${description}: ${renderWithStatusColor(message, status)}`;
}

function renderAlert(alert) {
  const message = alert.error ? `${alert.message}: ${formatError(alert.error)}` : alert.message;
  return renderHeader(alert.error ? "Error" : "Warning", message, alert.error ? 2 : 1);
}

function renderLogsMode() {
  console.log(chalk.blue(LOGS_MODE_MESSAGE));
}

function clearScreen() {
  process.stdout.write(CLRS);
}

function getCurrentMockMessageLevel(customRoutesVariants, currentMock) {
  if (customRoutesVariants.length) {
    return 1;
  }
  if (currentMock === "-") {
    return 2;
  }
  return 0;
}

module.exports = {
  renderSectionHeader,
  renderSectionFooter,
  renderHeader,
  renderAlert,
  renderLogsMode,
  formatError,
  clearScreen,
  getCurrentMockMessageLevel,
};
