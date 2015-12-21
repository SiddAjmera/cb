'use strict';

describe('Controller: IntroCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var IntroCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IntroCtrl = $controller('IntroCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
