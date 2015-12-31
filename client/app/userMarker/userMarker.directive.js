'use strict';

angular.module('cbApp')
  .directive('userMarker', function () {
    return {
      templateUrl: 'app/userMarker/userMarker.html',
      restrict: 'E',
      scope:{
      	contactno:"="
      },
      link: function (scope, element, attrs) {
      	console.log(scope.contactno);
      	scope.callMe = function(){
      		alert("directive function called!")
      	}
      }
    };
  });
