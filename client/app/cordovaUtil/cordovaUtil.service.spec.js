'use strict';

describe('Service: cordovaUtil', function () {

  // load the service's module
  beforeEach(module('cbApp'));

  // instantiate service
  var cordovaUtil;
  beforeEach(inject(function (_cordovaUtil_) {
    cordovaUtil = _cordovaUtil_;
  }));

  it('should do something', function () {
    expect(!!cordovaUtil).toBe(true);
  });

});
