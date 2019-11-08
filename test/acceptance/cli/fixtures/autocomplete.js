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
        name: "Select tags",
        value: "tags"
      }
    ]
  },
  tags: {
    type: "autocomplete",
    name: "value",
    message: "Insert tags:"
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

  async changeTags() {
    this._cli.clearScreen();
    const tags = ["a-tag", "b-tag", "c-tag"];
    this._selectedOption = await this._cli.inquire("tags", {
      source: (answers, input) => {
        const currentInput = input ? input.split(" ").pop() : null;
        if (!currentInput) {
          return Promise.resolve(tags);
        }
        return Promise.resolve(tags.filter(tag => tag.indexOf(currentInput) === 0));
      }
    });
    return this.displayMainMenu();
  }

  async displayMainMenu() {
    this._cli.clearScreen();
    this._selectedOption = await this._cli.inquire("main");
    if (this._selectedOption === "tags") {
      return this.changeTags();
    }
  }
};

new MyCli().displayMainMenu();
