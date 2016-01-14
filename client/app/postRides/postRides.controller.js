'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope,httpRequest,Auth,cordovaUtil,staticData) {
    $scope.message = 'Hello';
    $scope.ride = {};
    var currentUser = {};
    Auth.getCurrentUser().
    then(function(data){
        currentUser = data;
        console.log("currentUser",currentUser)
    });

    /*get tcs locations*/
   
     $scope.officeAddressJSON = staticData.getTCSLocations();
    

    $scope.showErrorMessage = false;
    $scope.leavingInJSON = [
                                {"text":"5 MIN","value":"5"},
                                {"text":"10 MIN","value":"10"},
                                {"text":"15 MIN","value":"15"},
                                {"text":"20 MIN","value":"20"},
                                {"text":"25 MIN","value":"25"},
                                {"text":"30 MIN","value":"30"},
                                {"text":"35 MIN","value":"35"},
                                {"text":"40 MIN","value":"40"},
                                {"text":"45 MIN","value":"45"},
                                {"text":"50 MIN","value":"50"},
                                {"text":"55 MIN","value":"55"},
                                {"text":"60 MIN","value":"60"},
                          	
                            ];

    $scope.availableSeatsJSON = ["1",
    						 "2",
    						 "3",
    						 "4",
    						 "5",
    						 "6"
    						];

    $scope.autocompleteOptions = {                        
                        types: ['(cities)'],
                        componentRestrictions: { country: 'IN',city:'Pune' },
                    }

 
    $scope.address='default'
    $scope.addressTo='default'
    $scope.optionAddressOptions=function(option){
        $scope.open=option;
        if(option=="from")
        $scope.ride.source=undefined;
    else
         $scope.ride.destination=undefined;
    }
     $scope.showAddressFrom=function(option){
        console.log(option)
        $scope.address=option;

        if($scope.address == "home"){
           $scope.ride.source= currentUser.homeAddress
           
        }

        $scope.otherAddress=true;
        $scope.open=false;
    }

    $scope.showAddressTo=function(option){
        console.log(option)
        $scope.addressTo=option;

        if($scope.addressTo == "homeTo"){
           $scope.ride.destination= currentUser.homeAddress
        }

        $scope.otherAddress=true;
        $scope.open=false;
    }

    $scope.postRide = function(){
        console.log("ride object",$scope.ride);
        var ride = {};

        if($scope.address=="other"){
            ride.startLocation = {
                                    formatted_address:$scope.ride.source.formatted_address,
                                    location:[$scope.ride.source.geometry.location.lat(),$scope.ride.source.geometry.location.lng()],
                                    placeId:$scope.ride.source.place_id,
                                    icon : $scope.ride.source.icon 
                                };
        
        }else if($scope.address=="home"){
            ride.startLocation = currentUser.homeAddressLocation;
        }
        else if($scope.address=="office"){
             ride.startLocation = $scope.ride.source;
        }
           



        if($scope.addressTo=="otherTo"){
            ride.endLocation = {
                                    formatted_address:$scope.ride.destination.formatted_address,
                                    location:[$scope.ride.destination.geometry.location.lat(),$scope.ride.destination.geometry.location.lng()],
                                    placeId:$scope.ride.destination.place_id,
                                    icon : $scope.ride.destination.icon 
                             };    
        
        }else if($scope.addressTo=="homeTo"){
            ride.endLocation = currentUser.homeAddressLocation;
        }
        else if($scope.addressTo=="officeTo"){
             ride.endLocation = $scope.ride.destination;
        }
        

                     
        ride.comments = $scope.ride.comments
        ride.offeredByUserId = currentUser.userId;
        ride.availableSeats = $scope.ride.availableSeats;
        ride.rideStartTime = moment().add(parseInt($scope.ride.leavingIn),"minutes").valueOf();
        ride.vehicleLicenseNumber = currentUser.vehicle.vehicleNo;
        console.log("final obj",ride)
        httpRequest.post(config.apis.postRide,ride).
        then(function(data){
            if(data.status==201){
                if(config.cordova)
                    cordovaUtil.showToastMessage("Ride posted succesfully!")
                else
                     alert("Ride posted succesfully!");
            }
                
               
        })
    }





  });
