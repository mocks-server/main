/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const Features = require("../../../lib/api/Features");

describe("Features Api", () => {
  let sandbox;
  let routerStubs;
  let resMock;
  let statusSpy;
  let sendSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routerStubs = {
      get: sandbox.stub(),
      put: sandbox.stub()
    };
    sandbox.stub(express, "Router").returns(routerStubs);
    statusSpy = sandbox.spy();
    sendSpy = sandbox.spy();
    resMock = {
      status: statusSpy,
      send: sendSpy
    };
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when instanciated", () => {
    it("should create an express Router", () => {
      new Features();
      expect(express.Router.calledOnce).toEqual(true);
    });
  });

  describe("getCurrent route", () => {
    it("should set response status as 200", () => {
      const features = new Features({
        currentFromCollection: "foo-current"
      });
      features.getCurrent({}, resMock);
      expect(statusSpy.getCall(0).args[0]).toEqual(200);
    });

    it("should send current feature from collection", () => {
      const features = new Features({
        currentFromCollection: "foo-current"
      });
      features.getCurrent({}, resMock);
      expect(sendSpy.getCall(0).args[0]).toEqual("foo-current");
    });
  });

  describe("putCurrent route", () => {
    it("should set current feature", () => {
      const features = new Features({
        currentFromCollection: "foo-current"
      });
      features.putCurrent(
        {
          body: {
            name: "foo-name"
          }
        },
        resMock
      );
      expect(features._features.current).toEqual("foo-name");
    });

    it("should send current feature from collection", () => {
      const features = new Features({
        currentFromCollection: "foo-current"
      });
      features.putCurrent(
        {
          body: {
            name: "foo-name"
          }
        },
        resMock
      );
      expect(sendSpy.getCall(0).args[0]).toEqual("foo-current");
    });
  });

  describe("getCollection route", () => {
    it("should set response status as 200", () => {
      const features = new Features({
        collection: "foo-collection"
      });
      features.getCollection({}, resMock);
      expect(statusSpy.getCall(0).args[0]).toEqual(200);
    });

    it("should send current features collection", () => {
      const features = new Features({
        collection: "foo-collection"
      });
      features.getCollection({}, resMock);
      expect(sendSpy.getCall(0).args[0]).toEqual("foo-collection");
    });
  });

  describe("router getter", () => {
    it("should return the express router", () => {
      const features = new Features();
      expect(features.router).toEqual(routerStubs);
    });
  });
});
