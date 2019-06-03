const sinon = require("sinon");

jest.mock("../../../lib/api/Settings");

const Settings = require("../../../lib/api/Settings");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      get: this._sandbox.stub(),
      put: this._sandbox.stub(),
      router: "foo-settings-router"
    };

    Settings.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Features,
      instance: this._stubs
    };
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
