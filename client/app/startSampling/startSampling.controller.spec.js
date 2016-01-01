'use strict';

describe('Controller: StartSamplingCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var StartSamplingCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StartSamplingCtrl = $controller('StartSamplingCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
