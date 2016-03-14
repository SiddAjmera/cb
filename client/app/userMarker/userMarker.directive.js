'use strict';

angular.module('cbApp')
  .directive('userMarker', function () {
    return {
      templateUrl: 'app/userMarker/userMarker.html',
      restrict: 'E',
      scope:{
      	contactno:"=",
        empid:"=",
        addemployee:"&"
      },
      link: function (scope, element, attrs) {
      	console.log("Scope in link function : ", scope);

        scope.callMe = function(){
      		alert("directive function called!")
      	};

        scope.callAddAsMember = function(){
          scope.addemployee(scope.empid.toString());
      };
    }
  }});
