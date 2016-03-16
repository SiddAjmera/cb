'use strict';

angular.module('cbApp')
  .directive('userMarker', function () {
    return {
      templateUrl: 'app/userMarker/userMarker.html',
      restrict: 'E',
      scope:{  //This represents an isolated scope. In this case this isolated scope will not be able to access the parent scope
      	contactno:"@", //@ will take the value of contactno AS STRING from it's consumer but won't update it if it's changed in the directive
        empid:"@",  //= provides a two way data binding. i.e. it will not only take the empid value of it's consumer but will also update it if it's changed here
        action:"&"  //& is used for methods
      },
      link: function (scope, element, attrs) {
          scope.onClick = function() {
            // Ad "id" to the locals of "editWebsite" 
            scope.action();
          }
      }
  }});