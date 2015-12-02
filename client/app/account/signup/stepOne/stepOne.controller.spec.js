'use strict';

describe('Controller: StepOneCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var StepOneCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StepOneCtrl = $controller('StepOneCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
