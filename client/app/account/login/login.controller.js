'use strict';

angular.module('cbApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window,$state) {
    $scope.user = {};
    $scope.loginForm = {};
    $scope.errorMsg = '';
    $scope.showErrorMessage = false;
    $scope.login = function() {
       $scope.errorMsg = '';
      $scope.showErrorMessage = true;
      if(!$scope.loginForm.$valid){   /*if form is invalid,return and show error messages */
            console.log($scope.loginForm) ;
            $("input.ng-invalid").eq(0).focus();      
            console.log("----------",$("input.ng-invalid"))
            return false;
       } 
    

      else if($scope.loginForm.$valid) {
        console.log($scope.loginForm)
        Auth.login({
          empId: $scope.user.empId,
          password: $scope.user.password
        })
        .then(function(response) {
          if(response.status==200){
             console.log(response)
            // Logged in, redirect to home
             $state.go('userHome.home');
          }
          else{
            $scope.errorMsg = "Please check Employee id or password"
          }
         
        },function(err){
           $scope.errorMsg = "Please check Employee id or password"
        })
        .catch( function(err) {
         $scope.errorMsg = "Please check Employee id or password"
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
