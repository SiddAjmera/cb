'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', function ($scope,$location, $window,$state,$modal,$rootScope,cordovaUtil,httpRequest,localStorage,pushnotification,staticData) {
    $scope.user = {};
    $scope.user.gender = "Female";
    $scope.timeSlotJSON = ["8:00 AM - 5:00 PM",
                                "9:00 AM - 6:00 PM",
                                "10:00 AM - 7:00 PM",
                                "11:00 AM - 8:00 PM",
                                "12:00 AM - 9:00 PM"
                               ];

    /*get tcs locations*/
 
     $scope.officeAddressJSON = staticData.getTCSLocations();
                              

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
         console.log($scope.signupForm) ;
         if(!$scope.signupForm.$valid){   /*if form is invalid,return and show error messages */
              console.log($scope.signupForm) ;
              $("input.ng-invalid").eq(0).focus();      
              console.log("----------",$("input.ng-invalid"))
              return false;
         } 

        /*else save the data*/
    
        // Function to save the UserObject in MongoDB
        
          if(config.cordova){
            pushnotification.registerPushNotification().then(function(redgId){
               $scope.user.redgId=redgId;
                $scope.signupPost();
            });          
         }
         else
          $scope.signupPost();
            
       }
       
       $scope.signupPost=function(){ 
         var url = config.apis.signup;
       // $scope.user.officeAddressLocation = $scope.user.officeAddress;
        //$scope.user.officeAddress = $scope.user.officeAddress.displayAddress;
         httpRequest.post(url,$scope.user).
          then(function(response){
              /*if(response.status==)*/
              if(response.status==200){
                 console.log('User Stored in the MongoDB Successfully. Here is the Response : ',response);
                  //$scope.response = response;
                  localStorage.store('token',response.data.token).then(function(){
                      $state.go("userHome.home");
              })
              }
             
            
        },function(err){
             console.log('Error Storing the User to the MongoDB. Here is the Error: ' + err);
             $scope.error = err;
        });
       
       }

   

    $scope.getLocation=function(){
         var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'components/modal/modal.html',
          controller: 'ModalCtrl',
          size: 'sm'
        });
        
        modalInstance.result.then(function(option){
          if(option == "yes")
          cordovaUtil.getUserHomeCoordinates().then(function(address){
            $scope.user.homeAddress = address.homeAddress;
            $scope.user.city = address.city;
            if(address.zipcode)
              $scope.user.zipcode = parseInt(address.zipcode);
            $scope.user.placeID = address.placeID;
            $scope.user.homeLocationCoordinates = [];
            $scope.user.homeLocationCoordinates.push(address.homeLocationCoordinates.lat);
            $scope.user.homeLocationCoordinates.push(address.homeLocationCoordinates.lng);
            $scope.user.homeAddressLocation = address.homeAddressLocation;
            $scope.user.state = address.state;
          });
        });
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
