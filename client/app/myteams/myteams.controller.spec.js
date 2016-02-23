'use strict';

describe('Controller: MyteamsCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var MyteamsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyteamsCtrl = $controller('MyteamsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
