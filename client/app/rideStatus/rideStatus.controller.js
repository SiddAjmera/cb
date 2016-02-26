'use strict';

angular.module('cbApp')
  .controller('RideStatusCtrl', function ($scope, httpRequest, $state) {
    $scope.message = 'Hello';
    $scope.leftButtonText = "RESCHEDULE RIDE";
    $scope.rightButtonText = "CANCEL RIDE";

    httpRequest.get(config.apis.latestActiveRideOfUser).
        then(function(data){
            console.log(data);
            if(data.status == 201) $scope.ride = data.data; 
        },function(err){
            console.log("err",err);
            if(err.status==409) alert('Error getting recent ride details'); 
        });

    $scope.leftButtonClicked = function(buttonText){
      if(buttonText == "RESCHEDULE RIDE"){
        $scope.leftButtonText = "CONFIRM RESCHEDULE";
        $scope.rightButtonText = "CANCEL";
      }
      else if(buttonText == "CONFIRM RESCHEDULE"){
        // TODO : Code to reschedule Ride
        alert('User confirmed to reschedule ride');
      }
    };

    $scope.rightButtonClicked = function(buttonText){
      if(buttonText == "CANCEL"){
        $scope.leftButtonText = "RESCHEDULE RIDE";
        $scope.rightButtonText = "CANCEL RIDE";
      }
      else if(buttonText == "CANCEL RIDE"){
        var r = confirm("Are you sure you want to cancel this ride?");
        if (r == true) {
            // TODO : Code to cancel the Ride
            alert('User confirmed to cancel ride');
        } else return;
      }
    };

    $scope.startRide = function(){
      $state.go('userHome.startSampling');
    }

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };
  });