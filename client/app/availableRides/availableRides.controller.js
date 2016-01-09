'use strict';

angular.module('cbApp')
  .controller('AvailableRidesCtrl', function ($scope,httpRequest,Auth) {

  	var currentUser = {};

  	Auth.getCurrentUser().then(function(user){currentUser = user;getAvailableRides();})

  	var getAvailableRides = function(){
  		var apis = config.apis.filterRides;
  		var requestJSON = {};

  		httpRequest.post(apis,requestJSON).
  		then(function(rides){
  			$scope.rides = rides.data;
  		})
  		
  	};



  	$scope.selectRide = function(ride){
  		var apis = config.apis.postRide+ride._id;
  		var requestJSON  = {};
  		requestJSON.companions = [];
  		requestJSON.companions.push({userId:currentUser.userId});
  		requestJSON.availableSeats=ride.availableSeats-1;
  		
  		httpRequest.put(apis,requestJSON).
  		then(function(response){
  			if(response.status==200){
  				getAvailableRides();
  				/*ride selected successfully. Show notification to ride owner*/
  			}
  		})
  	}

  	$scope.selectSeats = function(){

  	}


    
  });
