const sinon = require("sinon");

jest.mock("../../../lib/features/Features");

const Features = require("../../../lib/features/Features");

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      currentName: "foo-current-name",
      current: {}
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
}

module.exports = Mock;
