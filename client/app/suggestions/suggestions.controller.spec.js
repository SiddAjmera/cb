'use strict';

describe('Controller: SuggestionsCtrl', function () {

  // load the controller's module
  beforeEach(module('cbApp'));

  var SuggestionsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SuggestionsCtrl = $controller('SuggestionsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
