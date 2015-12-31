'use strict';

describe('Directive: userMarker', function () {

  // load the directive's module and view
  beforeEach(module('cbApp'));
  beforeEach(module('app/userMarker/userMarker.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<user-marker></user-marker>');
    element = $compile(element)(scope);
    scope.$apply();
  }));
});
