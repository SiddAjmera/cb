'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window,parse) {
    $scope.user = {vehicle:{}};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;
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
