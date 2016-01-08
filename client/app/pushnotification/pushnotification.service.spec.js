'use strict';

describe('Service: pushnotification', function () {

  // load the service's module
  beforeEach(module('cbApp'));

  // instantiate service
  var pushnotification;
  beforeEach(inject(function (_pushnotification_) {
    pushnotification = _pushnotification_;
  }));

  it('should do something', function () {
    expect(!!pushnotification).toBe(true);
  });

});
