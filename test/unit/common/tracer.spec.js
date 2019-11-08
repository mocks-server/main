/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const tracer = require("../../../lib/common/tracer");

describe("tracer", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "debug");
    sandbox.spy(console, "log");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("set method", () => {
    it("should call to set log level", () => {
      tracer.set("console", "error");
      tracer.debug("foo debug");
      expect(console.log.callCount).toEqual(0);
    });

    it("should deactivate logs if called with level silent", () => {
      tracer.set("console", "silent");
      tracer.error("foo error");
      expect(console.log.callCount).toEqual(0);
    });
  });
});
