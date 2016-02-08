'use strict';

describe('Controller: RideStatusCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var RideStatusCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RideStatusCtrl = $controller('RideStatusCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
