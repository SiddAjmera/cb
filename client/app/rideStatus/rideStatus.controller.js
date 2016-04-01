'use strict';

angular.module('cbApp')
  .controller('RideStatusCtrl', [ '$scope', 'Auth', 'httpRequest', '$state', '$timeout', 'cordovaUtil', function ($scope, Auth, httpRequest, $state, $timeout, cordovaUtil) {
    $scope.message = 'Hello';
    $scope.editableMode = false;
    $scope.leftButtonText = "RESCHEDULE RIDE";
    $scope.rightButtonText = "CANCEL RIDE";
    $scope.leavingInJSON =  [
                                {"text":"05 MIN","value":"5"},
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

    httpRequest.get(config.apis.latestActiveRideOfUser)
        .then(function(data){
            $scope.postedRide = data.data;

            Auth.getCurrentUser()
                .then(function(data){
                    $scope.user = data;
                    if($scope.user.empId == $scope.postedRide.offeredBy.empId){
                        $scope.leftButtonText = "RESCHEDULE RIDE";
                    }else{
                        $scope.leftButtonText = "TRACK DRIVER";
                    }
                 });

            console.log("postedRide : ", $scope.postedRide);
            var now = moment();
            var to = moment($scope.postedRide.rideScheduledTime);
            $scope.rideScheduledTime = Math.abs( now.diff(to,'minutes') );

            //To create a ticking minutes Clock. Time in minutes will automatically decrement by 1 each minute
            $scope.onTimeout = function(){
                $scope.rideScheduledTime--;
                if($scope.rideScheduledTime > 0) mytimeout = $timeout($scope.onTimeout,60000);
                else{
                  if(config.cordova) cordovaUtil.showToastMessage("Time is up! Your ride will be deleted from our system.")
                  else alert("Time is up! Your ride will be deleted from our system.");
                  httpRequest.delete(config.apis.deleteRide + $scope.postedRide._id)
                             .then(function(response){
                                if(response.satatus == 204){
                                    if(config.cordova) cordovaUtil.showToastMessage("Your ride has been deleted.")
                                    else alert("Your ride has been deleted.");
                                    $state.go('userHome.home');
                                }
                             }, function(err){
                                  if(err){
                                      if(config.cordova) cordovaUtil.showToastMessage("Your ride couldn't be deleted at this point.")
                                      else alert("Your ride couldn't be deleted at this point.");
                                      $state.go('userHome.home');
                                  }
                             });
                }
            }
            var mytimeout = $timeout($scope.onTimeout,60000);
        },function(err){
            if(err.status == 409){
                if(config.cordova) cordovaUtil.showToastMessage("Error getting your recent ride details.")
                else alert("Error getting your recent ride details.");
                $state.go('userHome.home');
            }
            if(err.status == 404){
              if(config.cordova) cordovaUtil.showToastMessage("You are not a part of an active ride. Please post a ride or request a ride to see it\'s details here")
              else alert("You are not a part of an active ride. Please post a ride or request a ride to see it\'s details here");
              $state.go('userHome.home');
            }
        });

    $scope.leftButtonClicked = function(buttonText){
      if(buttonText == "RESCHEDULE RIDE"){
        $scope.editableMode = true;
        $scope.leftButtonText = "CONFIRM";
        $scope.rightButtonText = "CANCEL";
      }
      else if(buttonText == "CONFIRM"){
        console.log("Leaving in : ", $scope.leavingIn);
        var postBody = {};
        postBody.newRideScheduledTime = moment().add(parseInt($scope.leavingIn),"minutes").valueOf();
        httpRequest.put(config.apis.rescheduleRide + $scope.postedRide._id, postBody)
                   .then(function(data){
                      console.log("Data after reschedule Ride : ", data);
                      if(data.status == 200){
                          if(config.cordova) cordovaUtil.showToastMessage('Ride rescheduled Successfully');
                          else alert('Ride rescheduled Successfully');
                          
                          console.log("Config.data.newRideScheduledTime : ", data.config.data.newRideScheduledTime);
                          var now = moment();
                          var to = moment(data.config.data.newRideScheduledTime);
                          $scope.rideScheduledTime = Math.abs( now.diff(to,'minutes') );
                          $scope.editableMode = false;
                          $scope.leftButtonText = "RESCHEDULE RIDE";
                          $scope.rightButtonText = "CANCEL RIDE";
                      }
                   }, function(err){
                      //alert("Ride can't be rescheduled at this point. Error : " + err);
                      if(config.cordova) cordovaUtil.showToastMessage('Ride can\'t be rescheduled at this point.');
                      else alert('Ride can\'t be rescheduled at this point.');
                   });
      }
      else if(buttonText == "TRACK DRIVER"){
          if(config.cordova) cordovaUtil.showToastMessage('This feature is in progress');
          else alert('This feature is in progress');
      }
    };

    $scope.rightButtonClicked = function(buttonText){
      if(buttonText == "CANCEL"){
        $scope.leftButtonText = "RESCHEDULE RIDE";
        $scope.rightButtonText = "CANCEL RIDE";
        $scope.editableMode = false;
      }
      else if(buttonText == "CANCEL RIDE"){
        var r = confirm("Are you sure you want to cancel this ride?");
        if (r == true) {
            // TODO : Code to cancel the Ride
            //alert('User confirmed to cancel ride');
            httpRequest.put(config.apis.cancelRide + $scope.postedRide._id)
                       .then(function(data){
                          console.log("Data from cancel ride : ", data);
                          if(data.status == 200){
                            if(config.cordova) cordovaUtil.showToastMessage('Ride Cancelled Successfully');
                            else alert('Ride Cancelled Successfully');
                            $state.go('userHome.home');
                          }
                       }, function(err){
                          alert("Ride can't be cancelled at this point. Error : " + err);
                          if(config.cordova) cordovaUtil.showToastMessage('Ride can\'t be cancelled at this point.');
                          else alert('Ride can\'t be cancelled at this point.');
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
  }]);