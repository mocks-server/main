const baseCli = require("../../../../lib/base-cli");

const questions = {
  main: {
    type: "list",
    message: "Select action:",
    name: "value",
    choices: [
      {
        name: "Main option 1",
        value: "option1"
      },
      {
        name: "Main option 2",
        value: "option2"
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

  async displayMainMenu() {
    this._cli.clearScreen();
    this._selectedOption = await this._cli.inquire("main");
    await this.displayMainMenu();
  }
};

new MyCli().displayMainMenu();
