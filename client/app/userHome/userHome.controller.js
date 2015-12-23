'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', function ($scope,Auth,$state,User) {
    $scope.message = 'Hello';
    $scope.tgState = false;
    $scope.currentUser = User.get();
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 

    	console.log("state change",toState,Auth.isLoggedIn());
  	

    });

    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    }

    $scope.logout = function(){
    	Auth.logout();
      $state.go("login")
    }
  });
