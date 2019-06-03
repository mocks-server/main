const sinon = require("sinon");

jest.mock("../../../lib/Server");

const Server = require("../../../lib/Server");

class CallBackRunner {
  constructor() {
    this.runner = this.runner.bind(this);
    this.executeCb = this.executeCb.bind(this);
    this._execute = false;
  }

  runner(eventName, cb) {
    if (this._execute) {
      cb();
    }
  }

  executeCb(execute) {
    this._execute = execute;
  }
}

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    const eventsRemoveListenerFake = new CallBackRunner();
    const eventsRemoveListenerStub = this._sandbox
      .stub()
      .callsFake(eventsRemoveListenerFake.runner);
    eventsRemoveListenerStub.executeCb = eventsRemoveListenerFake.executeCb;

    const eventsOnFake = new CallBackRunner();
    const eventsOnStub = this._sandbox.stub().callsFake(eventsOnFake.runner);
    eventsOnStub.executeCb = eventsOnFake.executeCb;

    this._stubs = {
      error: null,
      watchEnabled: true,
      features: {},
      settings: {},
      start: this._sandbox.stub(),
      restart: this._sandbox.stub(),
      switchWatch: this._sandbox.stub(),
      events: {
        removeListener: eventsRemoveListenerStub,
        on: eventsOnStub
      },
      stop: this._sandbox.stub()
    };

    Server.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Server,
      instance: this._stubs
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
