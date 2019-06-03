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
      }
    ]
  }
};

const MyCli = class MyCli {
  constructor() {
    this._cli = new baseCli.Inquirer(questions, this.header.bind(this), {
      name: "Custom Quit",
      action: this.customExitSelected.bind(this)
    });
    this._selectedOption = "None";
  }

  header() {
    return [`Selected option: ${this._selectedOption}`];
  }

  async customExitSelected() {
    this._selectedOption = "Quit";
    await this.displayMainMenu();
  }

  async displayMainMenu() {
    this._cli.clearScreen();
    this._selectedOption = await this._cli.inquire("main");
    await this.displayMainMenu();
  }
};

new MyCli().displayMainMenu();
