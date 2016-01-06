'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', function ($scope,Auth,$state,User) {
    $scope.message = 'Hello';
    $scope.tgState = false;
    $scope.currentUser=Auth.getCurrentUser();
    
    
    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    }

    $scope.logout = function(){
    	Auth.logout();
      $state.go("login")
    }
  });
