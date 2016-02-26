'use strict';

describe('Controller: FormTeamCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var FormTeamCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FormTeamCtrl = $controller('FormTeamCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
