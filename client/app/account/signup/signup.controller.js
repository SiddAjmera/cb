'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window,parse,$state) {
    $scope.user = {vehicle:{}};
    $scope.user.vehicle.capacity = "";
    $scope.timeSlotJSON = ["8:00 AM - 5:00 PM",
                                "9:00 AM - 6:00 PM",
                                "10:00 AM - 7:00 PM"
                               ];

    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.showErrorMessage = true;
    //$scope.errors = {};
    $scope.signupForm = {};
    console.log($state)
    
    $scope.step = 1;
    $state.go("signup.stepOne");

    $scope.goToStepTwo = function(){
      console.log($scope.signupForm);
      if(!$scope.signupForm.$valid){
        $scope.showErrorMessage = false;
        return;
      }
      else{
        $scope.showErrorMessage = true;
        $scope.step = 2;
        $state.go("signup.stepTwo");
      }

    }

     $scope.goToStepThree = function(){
      console.log($scope.signupForm);
      if(!$scope.signupForm.$valid){
        $scope.showErrorMessage = false;
        return;
      }
      else{
        $scope.showErrorMessage = true;
        $scope.step = 3;
        $state.go("signup.stepThree");
      }

    }


    $scope.register = function() {
      $scope.isRequired = true;
      console.log($scope.user);
       console.log($scope.signupForm);
       if(!$scope.signupForm.$valid){
            console.log($scope.signupForm) ;
            $("input.ng-invalid").eq(0).focus();      
            console.log("----------",$("input.ng-invalid"))
            return false;
        } 
      parse.saveObject("signupObject",$scope.user).
      then(function(response){
        console.log(response);
      })

    };



    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
