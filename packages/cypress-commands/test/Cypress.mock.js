import sinon from "sinon";
export default class Cypress {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      Commands: {
        add: this._sandbox.stub(),
      },
      env: this._sandbox.stub(),
      Promise: Promise,
    };

    this._cyStubs = {
      wrap: this._sandbox.stub().callsFake((promise) => {
        return promise;
      }),
      log: this._sandbox.stub(),
    };
  }

  get stubs() {
    return {
      Cypress: this._stubs,
      cy: this._cyStubs,
    };
  }

  restore() {
    this._sandbox.restore();
  }
}
