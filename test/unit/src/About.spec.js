/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const LibMocks = require("../Libs.mocks");
const CoreMocks = require("../Core.mocks");

const About = require("../../../src/About");
const { version } = require("../../../package.json");

describe("About", () => {
  let sandbox;
  let libMocks;
  let coreMock;
  let coreInstance;
  let resMock;
  let about;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    resMock = {
      status: sandbox.stub(),
      send: sandbox.stub(),
    };
    libMocks = new LibMocks();
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    about = new About(coreInstance);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    libMocks.restore();
    coreMock.restore();
  });

  describe("when created", () => {
    it("should create an express Router", async () => {
      expect(express.Router.calledOnce).toEqual(true);
    });

    it("should have added get router at /", async () => {
      expect(libMocks.stubs.express.get.getCall(0).args[0]).toEqual("/");
    });
  });

  describe("getAbout router", () => {
    it("should return current package version", () => {
      about.getAbout({}, resMock);
      expect(resMock.send.getCall(0).args[0]).toEqual({
        version,
      });
    });
  });

  describe("router getter", () => {
    it("should return express created router", async () => {
      expect(about.router).toEqual(libMocks.stubs.express);
    });
  });
});
