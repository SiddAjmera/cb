'use strict';

angular.module('cbApp')
  .controller('RideStatusCtrl', function ($scope, httpRequest, $state) {
    $scope.message = 'Hello';
    $scope.leftButtonText = "RESCHEDULE RIDE";
    $scope.rightButtonText = "CANCEL RIDE";

    httpRequest.get(config.apis.latestActiveRideOfUser)
        .then(function(data){
            //console.log("Data : ", data);
            $scope.postedRide = data.data;

            /*var rightNow = new Date().getTime();
            var dbReturned = new Date(moment($scope.postedRide.rideScheduledTime).format('DD-MM-YYYY HH:mm:ss')).getTime();
            $scope.rideScheduledTime = Math.round(Math.abs(( rightNow - dbReturned ) / (1000 * 60 * 60 * 60) ));*/
            var now = moment();
            var to = moment($scope.postedRide.rideScheduledTime);
            $scope.rideScheduledTime = now.diff(to,'minutes');
            //console.log("$scope.rideScheduledTime : ", $scope.rideScheduledTime)


            //console.log("Posted Ride : ", $scope.postedRide);
        },function(err){
            if(err.status == 409) alert('Error getting recent ride details');
            if(err.status == 404){
              alert('You are not a part of an active ride. Please post a ride or request a ride to see it\'s details here');
              $state.go('userHome.home');
            }
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
            httpRequest.put(config.apis.cancelRide + $scope.postedRide._id)
                       .then(function(data){
                          console.log("Data from cancel ride : ", data);
                          if(data.status == 200){
                            alert("Ride Cancelled Successfully");
                            $state.go('userHome.home');
                          }
                       }, function(err){
                          alert("Ride can't be cancelled at this point. Error : ", err);
                       });

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