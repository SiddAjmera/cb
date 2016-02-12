'use strict';

describe('Controller: RideDetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var RideDetailsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RideDetailsCtrl = $controller('RideDetailsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
