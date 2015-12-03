'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', function ($scope) {
    $scope.message = 'Hello';
    $scope.tgState = false;

    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    }
  });
