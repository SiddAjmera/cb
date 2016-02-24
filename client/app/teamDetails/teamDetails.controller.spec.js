'use strict';

describe('Controller: TeamDetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var TeamDetailsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TeamDetailsCtrl = $controller('TeamDetailsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
