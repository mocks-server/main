const sinon = require("sinon");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      Commands: {
        add: this._sandbox.stub()
      }
    };
  }

  get stubs() {
    return this._stubs;
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
