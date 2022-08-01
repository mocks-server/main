import sinon from "sinon";
export default class Cypress {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      Commands: {
        add: this._sandbox.stub(),
      },
      env: this._sandbox.stub(),
    };
  }

  get stubs() {
    return this._stubs;
  }

  restore() {
    this._sandbox.restore();
  }
}
