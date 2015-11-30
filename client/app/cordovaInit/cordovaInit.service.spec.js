'use strict';

describe('Service: cordovaInit', function () {

  // load the service's module
  beforeEach(module('cbApp'));

  // instantiate service
  var cordovaInit;
  beforeEach(inject(function (_cordovaInit_) {
    cordovaInit = _cordovaInit_;
  }));

  it('should do something', function () {
    expect(!!cordovaInit).toBe(true);
  });

});
