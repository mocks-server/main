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

  async displayMainMenu() {
    this._cli.clearScreen();

    setTimeout(() => {
      this._cli.removeListeners();
    }, 100); // Remove listeners will do promise never resolving. This is for testing purposes only

    this._selectedOption = await this._cli.inquire("main");

    if (this._selectedOption === "logs") {
      await this.displayLogs();
    }
    await this.displayMainMenu();
  }
};

new MyCli().displayMainMenu();
