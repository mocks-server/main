/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const commander = require("commander");

const options = require("../../../lib/common/options");

describe("options", () => {
  let sandbox;
  let optionStub;
  let parseStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    optionStub = sandbox.stub();
    parseStub = sandbox.stub().returns({});

    optionStub.returns({
      option: optionStub,
      parse: parseStub
    });

    sandbox.stub(commander, "option").returns({
      option: optionStub
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("get method", () => {
    it("should call to commander to get user options from command line", () => {
      options.get();
      expect(optionStub.callCount).toEqual(10);
    });

    it("should call to convert to number received value in --port option", () => {
      expect.assertions(1);
      optionStub.callsFake((commandName, description, parser) => {
        if (commandName.includes("--port")) {
          expect(parser("5")).toEqual(5);
        }
        return {
          option: optionStub,
          parse: parseStub
        };
      });
      options.get();
    });

    it("should extend default options with user options, ommiting undefined values", () => {
      parseStub.returns({
        feature: "foo-feature",
        cli: true,
        features: "foo/features/path"
      });
      expect(options.get()).toEqual({
        cli: true,
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        feature: "foo-feature",
        features: "foo/features/path",
        recursive: true
      });
    });
  });
});
