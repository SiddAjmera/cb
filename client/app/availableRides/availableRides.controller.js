'use strict';

angular.module('cbApp')
  .controller('AvailableRidesCtrl', function ($scope,httpRequest,Auth,socket) {
    console.log("Loading");
  	var currentUser = {};
  	$scope.rides = [];
    var rides=[];

    Auth.getCurrentUser().then(function(user){currentUser = user;getAvailableRides();})
    var populateSeats = function(ride){
      var seatMap = [];
      for(var i=0;i<ride.offeredByUser.totalNumberOfSeats;i++){       
        var seat = {};
        if(ride.companions[i])
          seat._id = ride.companions[i]._id;        
        seatMap.push(angular.copy(seat));
        ride.seatMap=seatMap;        
      }
      return ride;
    }

    var updateRideStatus=function(event,item){
        var newRide=populateSeats(item);
        var oldRide=_.findWhere($scope.rides,{'_id':item._id});
        console.log("newRide,oldRide ",newRide,oldRide);
        if(oldRide){
          $scope.rides=_.reject($scope.rides,function(obj){
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
  				//$scope.rides = rides;
  				angular.forEach(rides, function(ride, key){
  					var r=populateSeats(ride)
            $scope.rides.push(r);  
  				});
  				console.log($scope.rides);
  			}
  			
  		})
  		
  	};

  	$scope.selectRide = function(ride){
  		var apis = config.apis.selectRide+ride._id;
  		var requestJSON  = {};
  		requestJSON.companions = [];
  		angular.forEach(ride.seatMap, function(r, key){
  			if(angular.isDefined(r.selected) && r.selected){
  				var o={};
  				o.userId=currentUser.userId;
  				requestJSON.companions.push(o);
  			}
  			
  		});
  		
  		
  		requestJSON.availableSeats=ride.availableSeats-requestJSON.companions.length;
  		
  		httpRequest.put(apis,requestJSON).
  		then(function(response){
  			if(response.status==200){
  				//getAvailableRides();
  				/*ride selected successfully. Show notification to ride owner*/
  			}
  		})
  	}

  	$scope.selectSeat = function(seat){
  		if(seat._id)
  			return;

  		if(angular.isDefined(seat.selected))
  			seat.selected=!seat.selected;
  		else
  			seat.selected = true;
  	}


    
  });
