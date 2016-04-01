'use strict';

angular.module('cbApp')
  .controller('AvailableRidesCtrl', [ '$scope', 'httpRequest', 'Auth', 'socket', 'cordovaUtil', '$state' , function ($scope, httpRequest, Auth, socket, cordovaUtil, $state) {
    console.log("Loading");
  	var currentUser = {};
  	$scope.rides = [];
    var rides=[];

    Auth.getCurrentUser()
        .then(function(user){
            currentUser = user;
            getAvailableRides();
        });

    var populateSeats = function(ride){
      var seatMap = [];
      for(var i = 0 ; i < ride.initiallyAvailableSeats ; i++){       
        var seat = {};
        if(ride.riders[i]) seat._id = ride.riders[i]._id;        
        seatMap.push(angular.copy(seat));
        ride.seatMap=seatMap;        
      }
      return ride;
    }

    var updateRideStatus=function(event,item){
        var newRide=populateSeats(item);
        var oldRide=_.findWhere($scope.rides,{'_id':item._id});
        console.log("newRide, oldRide", newRide, oldRide);
        if(oldRide){
          $scope.rides = _.reject($scope.rides, function(obj){
            return obj._id==oldRide._id;
          });
        }
        $scope.rides.push(newRide);
    };

    socket.syncUpdates('ride',[],function(event,item,array){
        console.log('item  ',item,event);
        updateRideStatus(event,item);
    });

  	var getAvailableRides = function(){
  		var apis = config.apis.filterRides;
  		var requestJSON = {};
      requestJSON.userId = currentUser.userId;
  		$scope.rides = [];
  		httpRequest.post(apis,requestJSON).
  		then(function(rides){
  			if(rides.status==200){
          rides = rides.data;
  				angular.forEach(rides, function(ride, key){
            var r = populateSeats(ride.obj)
            $scope.rides.push(r);  
  				});
  				console.log($scope.rides);
  			}
  		})
  	};

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }
    
  	$scope.selectRide = function(ride){
  		var apis = config.apis.selectRide + ride._id;
  		var requestJSON  = {};
  		requestJSON.companions = [];
  		angular.forEach(ride.seatMap, function(r, key){
  			if(angular.isDefined(r.selected) && r.selected){
  				var o = {};
  				o.userId = currentUser.userId;
          o.status = "PENDING";
  				requestJSON.companions.push(o);
          //requestJSON.companions.push(currentUser.userId);
  			}
  		});
  		
  		if(requestJSON.companions.length==0){
  			 if(config.cordova) cordovaUtil.showToastMessage("Select atleast one seat")
         else alert("Select atleast one seat");
         return;
  		}
  		
  		requestJSON.availableSeats = ride.availableSeats - requestJSON.companions.length;
  		
  		httpRequest.put(apis,requestJSON).
  		then(function(response){
        console.log(response);
  			if(response.status == 201){
  				/*ride selected successfully. Show notification to ride owner*/
          if(config.cordova) cordovaUtil.showToastMessage('Your ride has been booked successfully.');
          else alert('Your ride has been booked successfully.');
          $state.go('userHome.rideStatus');
  			}else if(response.status == 409){
          if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
          else alert('You are already part of an Active Ride');
          $state.go('userHome.rideStatus');
        }
  		},function(err){
            console.log("err",err);
            if(err.status == 409){
                if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
                else alert('You are already part of an Active Ride');
                $state.go('userHome.rideStatus');
            }
        })
  	}

  	$scope.selectSeat = function(seat){
  		if(seat._id) return;
  		if(angular.isDefined(seat.selected)) seat.selected =! seat.selected;
  		else seat.selected = true;
  	}


    
  }]);
