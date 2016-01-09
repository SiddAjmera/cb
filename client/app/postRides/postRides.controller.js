'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope,httpRequest,Auth) {
    $scope.message = 'Hello';
    $scope.ride = {};
    var currentUser = {};
    Auth.getCurrentUser().
    then(function(data){
        currentUser = data;
    });
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
                        componentRestrictions: { country: 'IND',city:'Pune' },
                    }

    var calculateRideStartTime = function(leavingIn){
        return moment().add(parseInt(leavingIn),"minutes").valueOf();

    }

    $scope.postRide = function(){
        console.log("ride object",$scope.ride);
        var ride = {};
        ride.startLocation = {
                                    formatted_address:$scope.ride.source.formatted_address,
                                    location:[$scope.ride.source.geometry.location.lat(),$scope.ride.source.geometry.location.lng()],
                                    placeId:$scope.ride.source.place_id,
                                    icon : $scope.ride.source.icon 
                             };
        ride.endLocation = {
                                    formatted_address:$scope.ride.destination.formatted_address,
                                    location:[$scope.ride.destination.geometry.location.lat(),$scope.ride.destination.geometry.location.lng()],
                                    placeId:$scope.ride.destination.place_id,
                                    icon : $scope.ride.destination.icon 
                             };                 
       
        ride.offeredByUserId = currentUser.userId;
        ride.availableSeats = $scope.ride.availableSeats;
        ride.rideStartTime = moment().add(parseInt($scope.ride.leavingIn),"minutes").valueOf();
        ride.vehicleLicenseNumber = currentUser.vehicle.vehicleNo;
        console.log("final obj",ride)
        httpRequest.post(config.apis.postRide,ride).
        then(function(data){
            if(data.status==201)
                alert("Ride posted Succesfully!");
        })
    }



  });
