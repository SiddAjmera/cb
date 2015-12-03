'use strict';

describe('Controller: AvailableRidesCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var AvailableRidesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AvailableRidesCtrl = $controller('AvailableRidesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
