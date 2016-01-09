'use strict';

describe('Directive: scroll', function () {

  // load the directive's module and view
  beforeEach(module('cbApp'));
  beforeEach(module('app/scroll/scroll.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<scroll></scroll>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the scroll directive');
  }));
});