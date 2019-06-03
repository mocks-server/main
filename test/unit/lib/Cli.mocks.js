const sinon = require("sinon");

jest.mock("../../../lib/Cli");

const Cli = require("../../../lib/Cli");

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      start: this._sandbox.stub().resolves()
    };

    Cli.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Cli,
      instance: this._stubs
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
