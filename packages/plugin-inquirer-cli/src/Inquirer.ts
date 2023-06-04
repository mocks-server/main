/*
Copyright 2021-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { EventEmitter } from "events";

import { Answers, registerPrompt, prompt, Separator } from "inquirer";
import type { ListQuestion } from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import { cloneDeep } from "lodash";

import {
  renderSectionHeader,
  renderSectionFooter,
  renderLogsMode,
  clearScreen,
  log,
} from "./Helpers";

import type {
  ClearScreenOptions,
  GetAlerts,
  GetHeaders,
  InquirerConstructor,
  InquirerInterface,
  InquirerOptions,
  InquirerQuestion,
  InquirerQuestionsMap,
} from "./Inquirer.types";

registerPrompt("autocomplete", autocomplete);

const STDIN_ENCODING = "utf8";
const CTRL_C = "\u0003";

const EVENT_LISTENER = "keypress";
const STDIN_EVENT = "data";

const MAIN_MENU_ID = "main";
const DEFAULT_QUIT_NAME = "Exit";
const QUIT_ACTION_ID = "quit";

const QUIT_QUESTION = {
  name: DEFAULT_QUIT_NAME,
  value: QUIT_ACTION_ID,
};

function exitProcess(): never {
  process.exit();
}

function isListQuestion(question: InquirerQuestion): question is ListQuestion {
  return question.type === "list";
}

EventEmitter.defaultMaxListeners = 1000;

export const Inquirer: InquirerConstructor = class Inquirer implements InquirerInterface {
  private _emojisEnabled: boolean;
  private _alertsHeader: GetAlerts;
  private _header: GetHeaders;
  private _currentInquirers: Set<(value?: unknown) => unknown>;
  private _questions: InquirerQuestionsMap;
  private _logModeExit: null | ((value?: void) => void);

  constructor(getHeader: GetHeaders, getAlerts: GetAlerts, { emojis }: InquirerOptions = {}) {
    this._emojisEnabled = emojis || false;
    this._alertsHeader = getAlerts;
    this._header = getHeader;

    this._exitLogsMode = this._exitLogsMode.bind(this);
    this._currentInquirers = new Set();
  }

  private _initQuestions(questions: InquirerQuestionsMap): InquirerQuestionsMap {
    const clonedQuestions = cloneDeep(questions);
    if (clonedQuestions[MAIN_MENU_ID] && isListQuestion(clonedQuestions[MAIN_MENU_ID])) {
      const questionChoices = (clonedQuestions[MAIN_MENU_ID] as ListQuestion)?.choices as [
        unknown
      ];
      questionChoices.push(new Separator());
      questionChoices.push(QUIT_QUESTION);
    }
    return clonedQuestions;
  }

  public set questions(questions: InquirerQuestionsMap) {
    this._questions = this._initQuestions(questions);
  }

  public exitLogsMode(): void {
    if (this._logModeExit) {
      const stdin = process.stdin;
      if (stdin.setRawMode) {
        stdin.setRawMode(false);
      }
      stdin.pause();
      stdin.removeListener(STDIN_EVENT, this._exitLogsMode);
      this._logModeExit();
      this._logModeExit = null;
    }
  }

  private _exitLogsMode(key: string): void {
    if (key === CTRL_C) {
      process.exit();
    }
    this.exitLogsMode();
  }

  public async logsMode(startLogs?: () => void): Promise<void> {
    this.clearScreen();
    renderLogsMode();
    const stdin = process.stdin;
    if (stdin.setRawMode) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding(STDIN_ENCODING);
    stdin.on(STDIN_EVENT, this._exitLogsMode);
    if (startLogs) {
      startLogs();
    }
    return new Promise((resolve) => {
      this._logModeExit = resolve;
    });
  }

  private _resolvePreviousInquirers() {
    this._currentInquirers.forEach((inquirerPromise) => {
      inquirerPromise();
      this._currentInquirers.delete(inquirerPromise);
    });
  }

  public async inquire(
    questionKey: string,
    extendProperties?: Partial<InquirerQuestion>
  ): Promise<unknown> {
    this._resolvePreviousInquirers();
    this.removeListeners();
    return new Promise((resolve) => {
      this._currentInquirers.add(resolve);
      prompt({
        ...this._questions[questionKey],
        ...extendProperties,
      }).then((answers: Answers) => {
        this._currentInquirers.delete(resolve);
        this.removeListeners();
        if (questionKey === MAIN_MENU_ID && answers.value === QUIT_ACTION_ID) {
          this.quit();
        }
        resolve(answers.value);
      });
    });
  }

  public quit(): never {
    exitProcess();
  }

  private _emojiKey(key: string): string | undefined {
    if (this._emojisEnabled) {
      return key;
    }
  }

  public clearScreen(options: ClearScreenOptions = {}): void {
    clearScreen();
    if (options.header !== false) {
      const headers = (this._header && this._header()) || [];
      const alerts = (this._alertsHeader && this._alertsHeader()) || [];
      if (alerts.length) {
        renderSectionHeader("ALERTS", this._emojiKey(":warning:"));
        alerts.forEach((alert) => log(alert));
        renderSectionFooter();
      }
      renderSectionHeader("CURRENT SETTINGS", this._emojiKey(":information_source:"));
      headers.forEach((header) => log(header));
      renderSectionFooter();
      renderSectionHeader("ACTIONS", this._emojiKey(":arrow_up_down:"));
    }
  }

  public removeListeners(): void {
    const listeners = process.stdin.listeners(EVENT_LISTENER);
    listeners.forEach((listener) => {
      process.stdin.removeListener(EVENT_LISTENER, listener as () => void);
    });
  }

  public set emojis(enabled: boolean) {
    this._emojisEnabled = enabled;
  }
};
