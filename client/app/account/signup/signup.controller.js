'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window,parse) {
    $scope.user = {vehicle:{}};
    $scope.isRequired = false;
    //$scope.errors = {};

    $scope.register = function() {
      $scope.isRequired = true;
      console.log($scope.user);

      parse.saveObject("signupObject",$scope.user).
      then(function(response){
        console.log(response);
      })

    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
