"use strict";

const { cloneDeep, map, sum } = require("lodash");
const routeParser = require("route-parser");

const { FUNCTION_TYPE } = require("../common/constants");

class Feature {
  constructor(fixtures) {
    this._fixtures = fixtures;
    this._methods = this.fixturesToMethods(fixtures);
    this._fixturesCollection = this.fixturesToCollection(fixtures);
  }

  fixturesToCollection(fixtures) {
    return cloneDeep(fixtures).map(fixture => {
      if (typeof fixture.response === FUNCTION_TYPE) {
        fixture.response = FUNCTION_TYPE;
      }
      delete fixture.route;
      return fixture;
    });
  }

  fixturesToMethods(fixtures, baseFixtures = {}) {
    const fixturesObject = cloneDeep(baseFixtures);
    fixtures.forEach(fixtureData => {
      fixturesObject[fixtureData.method] = fixturesObject[fixtureData.method] || {};
      fixturesObject[fixtureData.method][fixtureData.url] = {
        route: routeParser(fixtureData.url),
        response: fixtureData.response
      };
    });
    return fixturesObject;
  }

  extend(fixtures) {
    return new Feature(this._fixtures.concat(fixtures));
  }

  get methods() {
    return this._methods;
  }

  get fixtures() {
    return this._fixturesCollection;
  }

  get totalFixtures() {
    return sum(map(this._methods, urls => Object.keys(urls).length));
  }
}

module.exports = Feature;
