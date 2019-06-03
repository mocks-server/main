"use strict";

const chalk = require("chalk");
const inquirer = require("inquirer");
const autocomplete = require("inquirer-autocomplete-prompt");
const { cloneDeep, map } = require("lodash");

inquirer.registerPrompt("autocomplete", autocomplete);

const STDIN_ENCODING = "utf8";
const CTRL_C = "\u0003";
const CLRS = "\x1Bc";
const EVENT_LISTENER = "keypress";
const STDIN_EVENT = "data";

const HEADER_ITEM = chalk.yellow(">>");
const HEADER_FOOTER = "------------------------------------";
const MAIN_MENU_ID = "main";
const DEFAULT_QUIT_NAME = "Exit";
const QUIT_ACTION_ID = "quit";
const LOGS_MODE_MESSAGE = "Displaying logs. Press any key to display main menu again";

const Inquirer = class Inquirer {
  constructor(questions, header, quitMethod) {
    this._header = header;
    this._questions = this._initQuestions(questions, quitMethod);
    this._exitLogsMode = this._exitLogsMode.bind(this);
  }

  _initQuestions(questions, quitMethod) {
    const clonedQuestions = cloneDeep(questions);
    const quitQuestion = {
      name: DEFAULT_QUIT_NAME,
      value: QUIT_ACTION_ID
    };
    if (clonedQuestions[MAIN_MENU_ID] && clonedQuestions[MAIN_MENU_ID].choices) {
      clonedQuestions[MAIN_MENU_ID].choices.push(new inquirer.Separator());
      if (quitMethod) {
        clonedQuestions[MAIN_MENU_ID].choices.push({
          ...quitQuestion,
          name: quitMethod.name
        });
        this._quit = quitMethod.action;
      } else {
        clonedQuestions[MAIN_MENU_ID].choices.push(quitQuestion);
        this._quit = () => process.exit();
      }
    }
    return clonedQuestions;
  }

  exitLogsMode() {
    if (this._logModeExit) {
      const stdin = process.stdin;
      if (stdin.setRawMode) {
        stdin.setRawMode(false);
      }
      stdin.pause();
      stdin.removeListener(STDIN_EVENT, this._exitLogsMode);
      this._logModeExit();
      delete this._logModeExit;
    }
  }

  _exitLogsMode(key) {
    if (key === CTRL_C) {
      process.exit();
    }
    this.exitLogsMode();
  }

  async logsMode(startLogs) {
    this.clearScreen();
    console.log(chalk.blue(LOGS_MODE_MESSAGE));
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
    return new Promise(resolve => {
      this._logModeExit = resolve;
    });
  }

  async inquire(questionKey, extendProperties) {
    const answers = await inquirer.prompt({
      ...this._questions[questionKey],
      ...extendProperties
    });
    this.removeListeners();
    if (questionKey === MAIN_MENU_ID && answers.value === QUIT_ACTION_ID) {
      return this._quit();
    }
    return answers.value;
  }

  quit() {
    this._quit();
  }

  clearScreen(opts) {
    const options = opts || {};
    process.stdout.write(CLRS);
    if (options.header !== false) {
      const headers = (this._header && this._header()) || [];
      headers.map(header => console.log(`${HEADER_ITEM} ${header}`));
      console.log(HEADER_FOOTER);
    }
  }

  removeListeners() {
    const listeners = process.stdin.listeners(EVENT_LISTENER);
    map(listeners, listener => {
      process.stdin.removeListener(EVENT_LISTENER, listener);
    });
  }
};

module.exports = {
  Inquirer
};
