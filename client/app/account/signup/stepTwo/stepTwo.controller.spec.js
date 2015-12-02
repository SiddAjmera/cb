'use strict';

describe('Controller: StepTwoCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var StepTwoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StepTwoCtrl = $controller('StepTwoCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
