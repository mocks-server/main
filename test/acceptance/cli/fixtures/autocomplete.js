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
    switch (this._selectedOption) {
      case "tags":
        return this.changeTags();
    }
  }
};

new MyCli().displayMainMenu();
