'use strict';

describe('Controller: PostRidesCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var PostRidesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PostRidesCtrl = $controller('PostRidesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
