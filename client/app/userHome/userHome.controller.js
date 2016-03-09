'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', function ($scope,Auth,$state,User) {
    $scope.message = 'Hello';
    $scope.tgState = false;
    Auth.getCurrentUser().then(function(data){return $scope.currentUser = data});
    
    
    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

    $scope.logout = function(){
    	Auth.logout();
      $state.go("login")
    }
  });
