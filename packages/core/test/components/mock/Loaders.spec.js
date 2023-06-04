/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { DefinitionsManager } = require("../../../src/mock/DefinitionsManager");

describe("DefinitionsManager", () => {
  let sandbox;
  let onLoad;
  let loaders;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.spy(console, "log");
    onLoad = sandbox.stub();
    loaders = new DefinitionsManager({ onLoad });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createLoader method", () => {
    it("should return a load function", async () => {
      expect(typeof loaders.createLoader()).toEqual("function");
    });
  });

  describe("load function", () => {
    it("should call to onLoad callback", async () => {
      const load = loaders.createLoader();
      load(["foo1", "foo2"]);

      expect(onLoad.callCount).toEqual(1);
    });

    it("should replace all previously loaded contents", async () => {
      expect.assertions(2);

      const load = loaders.createLoader();
      load(["foo1", "foo2"]);

      expect(loaders.definitions).toEqual(["foo1", "foo2"]);

      load(["foo3", "foo4"]);

      expect(loaders.definitions).toEqual(["foo3", "foo4"]);
    });

    it("should not replace contents of other load functions", async () => {
      expect.assertions(2);

      const load = loaders.createLoader();
      const load2 = loaders.createLoader();
      load(["foo1", "foo2"]);
      load2(["foo3", "foo4"]);

      expect(loaders.definitions).toEqual(["foo1", "foo2", "foo3", "foo4"]);

      load2(["foo5", "foo6"]);

      expect(loaders.definitions).toEqual(["foo1", "foo2", "foo5", "foo6"]);
    });
  });
});
