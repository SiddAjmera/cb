'use strict';

describe('Controller: UserProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var UserProfileCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UserProfileCtrl = $controller('UserProfileCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
