'use strict';

describe('Controller: CurrentRideCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var CurrentRideCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CurrentRideCtrl = $controller('CurrentRideCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
