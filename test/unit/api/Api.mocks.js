const sinon = require("sinon");

jest.mock("../../../lib/api/Api");

const Api = require("../../../lib/api/Api");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      router: this._sandbox.stub()
    };

    Api.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Api,
      instance: this._stubs
    };
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
