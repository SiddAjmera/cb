'use strict';

angular.module('cbApp')
  .controller('IntroCtrl', function ($scope, Auth, $state) {
    $scope.message = 'Hello';
    $scope.goToLandingPage = function(){
    	Auth.logout();
        $state.go("signup");
    };
  });
