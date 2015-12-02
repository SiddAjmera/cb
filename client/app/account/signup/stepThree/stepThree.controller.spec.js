'use strict';

describe('Controller: StepThreeCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var StepThreeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StepThreeCtrl = $controller('StepThreeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
