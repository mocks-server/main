/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const Loaders = require("../../src/mock/Loaders");

describe("Loaders", () => {
  let sandbox;
  let onLoad;
  let loaders;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.spy(console, "log");
    onLoad = sandbox.stub();
    loaders = new Loaders({ onLoad });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("new method", () => {
    it("should return a load function", async () => {
      expect(typeof loaders.new()).toEqual("function");
    });
  });

  describe("load function", () => {
    it("should call to onLoad callback", async () => {
      const load = loaders.new();
      load(["foo1", "foo2"]);
      expect(onLoad.callCount).toEqual(1);
    });

    it("should replace all previously loaded contents", async () => {
      expect.assertions(2);
      const load = loaders.new();
      load(["foo1", "foo2"]);
      expect(loaders.contents).toEqual(["foo1", "foo2"]);
      load(["foo3", "foo4"]);
      expect(loaders.contents).toEqual(["foo3", "foo4"]);
    });

    it("should not replace contents of other load functions", async () => {
      expect.assertions(2);
      const load = loaders.new();
      const load2 = loaders.new();
      load(["foo1", "foo2"]);
      load2(["foo3", "foo4"]);
      expect(loaders.contents).toEqual(["foo1", "foo2", "foo3", "foo4"]);
      load2(["foo5", "foo6"]);
      expect(loaders.contents).toEqual(["foo1", "foo2", "foo5", "foo6"]);
    });
  });
});
