/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const baseCli = require("../../../../lib/base-cli");

const questions = {
  main: {
    type: "list",
    message: "Select action:",
    name: "value",
    choices: [
      {
        name: "Option 1",
        value: "option1"
      },
      {
        name: "Display logs",
        value: "logs"
      }
    ]
  }
};

const MyCli = class MyCli {
  constructor() {
    this._cli = new baseCli.Inquirer(questions, this.header.bind(this));
    this._selectedOption = "None";
  }

  header() {
    return [`Selected option: ${this._selectedOption}`];
  }

  async displayLogs() {
    await this._cli.logsMode(() => {
      console.log("This is a foo log");
    });
  }

  async displayMainMenu() {
    this._cli.clearScreen();
    this._selectedOption = await this._cli.inquire("main");
    if (this._selectedOption === "logs") {
      await this.displayLogs();
    }
    await this.displayMainMenu();
  }
};

new MyCli().displayMainMenu();
