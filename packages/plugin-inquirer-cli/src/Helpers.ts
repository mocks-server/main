/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { AlertsFlat, ScopedCoreInterface } from "@mocks-server/core";
import chalk from "chalk";
import { trim } from "lodash";
import { emojify } from "node-emoji";

import type { HeaderStatusLevel, HeaderColor, HeaderMessage } from "./Helpers.types";

const CLEAR_SCREEN = "\x1Bc";
const SECTION_SEP: string = new Array(60).fill("─").join("");
const HEADERS_STATUS_COLORS: HeaderColor[] = ["green", "yellow", "red"];
const ALERTS_TAB_LINE = `\n${new Array(9).fill(" ").join("")}`;
const LOGS_MODE_MESSAGE = "Displaying logs. Press any key to display main menu again";

function getHeaderStatusColor(statusLevel: HeaderStatusLevel = 0): HeaderColor {
  return HEADERS_STATUS_COLORS[statusLevel];
}

function renderWithStatusColor(
  message: HeaderMessage,
  statusLevel: HeaderStatusLevel = 0
): string {
  return chalk[getHeaderStatusColor(statusLevel)](message);
}

export function log(...args: string[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function formatError(error: Error): string {
  const stack = error.stack as string;
  return `${error.message}${ALERTS_TAB_LINE}${trim(
    stack.split("\n").slice(0, 3).join("\n").replace(/\n/gim, ALERTS_TAB_LINE)
  )}...`;
}

function renderSectionSep(): void {
  log(chalk.grey(SECTION_SEP));
}

export function renderSectionHeader(sectionName: string, sectionEmoji?: string): void {
  renderSectionSep();
  if (sectionEmoji) {
    log(emojify(`${sectionEmoji}  ${sectionName}`));
  } else {
    log(sectionName);
  }
  renderSectionSep();
}

export function renderSectionFooter() {
  log("");
}

export function renderHeader(
  description: string,
  message: HeaderMessage,
  status?: HeaderStatusLevel,
  context?: string
): string {
  const contextToRender = context ? chalk.grey(`[${context}] `) : "";
  return `${chalk.bold("‧")} ${description}: ${contextToRender}${renderWithStatusColor(
    message,
    status
  )}`;
}

export function renderAlert(alert: AlertsFlat[0]): string {
  const message = alert.error ? `${alert.message}: ${formatError(alert.error)}` : alert.message;
  return renderHeader(
    alert.error ? "Error" : "Warning",
    message,
    alert.error ? 2 : 1,
    alert.id as string
  );
}

export function renderLogsMode(): void {
  log(chalk.blue(LOGS_MODE_MESSAGE));
}

export function clearScreen(): void {
  process.stdout.write(CLEAR_SCREEN);
}

export function getCurrentMockMessageLevel(
  customRoutesVariants: ScopedCoreInterface["mock"]["customRouteVariants"],
  currentMock: string
): HeaderStatusLevel {
  if (customRoutesVariants.length) {
    return 1;
  }
  if (currentMock === "-") {
    return 2;
  }
  return 0;
}
