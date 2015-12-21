'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', function ($scope,Auth,$state) {
    $scope.message = 'Hello';
    $scope.tgState = false;

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 

    	console.log("state change",toState,Auth.isLoggedIn());
  	

    });

    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    }

    $scope.logout = function(){
    	Auth.logout();
    }
  });
