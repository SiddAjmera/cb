'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window,parse,$state) {
    $scope.user = {vehicle:{}};
    
    $scope.timeSlotJSON = ["8:00 AM - 5:00 PM",
                                "9:00 AM - 6:00 PM",
                                "10:00 AM - 7:00 PM"
                               ];

    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.showErrorMessage = true;
    var currentStep = 1;
   
    $scope.signupForm = {};
    
    //by default, or on page refresh, redirect to first step.
    $scope.step = 1;
    $state.go("signup.stepOne");


    /*function for traversing between steps*/
    $scope.goToStep = function(step){
        if(step==currentStep)
          return;

        if(step>currentStep){
             if(!$scope.signupForm.$valid){
                $scope.showErrorMessage = false;
                return;
              }
              else{
                  $scope.showErrorMessage = true;
                  $scope.step = step;
                  currentStep = step;
                  if(step==1)
                    $state.go("signup.stepOne");
                  if(step==2)
                    $state.go("signup.stepTwo");
                  if(step==3)
                    $state.go("signup.stepThree");
              }
        }
        else{
             $scope.step = step;
             currentStep = step;
             $scope.showErrorMessage = true;
             if(step==1)
                  $state.go("signup.stepOne");
             if(step==2)
                  $state.go("signup.stepTwo");
        }

   }


   /*signup function called on form submit*/

    $scope.register = function() {
     
       $scope.showErrorMessage = false;
       
       if(!$scope.signupForm.$valid){   /*if form is invalid,return and show error messages */
            console.log($scope.signupForm) ;
            $("input.ng-invalid").eq(0).focus();      
            console.log("----------",$("input.ng-invalid"))
            return false;
       } 

       /*else save the data*/
      parse.saveObject("signupObject",$scope.user).
      then(function(response){
        console.log(response.toJSON());
       
         alert("User created successfully");
         $state.go("main")
      });

    };



    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
