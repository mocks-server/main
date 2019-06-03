const sinon = require("sinon");

jest.mock("../../../lib/Settings");

const Settings = require("../../../lib/Settings");

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      delay: 200
    };

    Settings.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Settings,
      instance: this._stubs
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
