const sinon = require("sinon");

jest.mock("../../../lib/api/Features");

const Features = require("../../../lib/api/Features");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      getCurrent: this._sandbox.stub(),
      putCurrent: this._sandbox.stub(),
      getCollection: this._sandbox.stub(),
      router: "foo-features-router"
    };

    Features.mockImplementation(() => this._stubs);
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
