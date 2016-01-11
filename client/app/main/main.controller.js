'use strict';

angular.module('cbApp')
  .controller('MainCtrl', function ($scope, $http, socket, cordovaUtil, $state, localStorage) {

   
	  
	  $scope.saveDeviceInfo=function()
	  {
		  cordovaUtil.saveDeviceDetails();
	  }
	  

    $scope.openMap = function(){
      $state.go('map');
    }

	  $scope.startTracking=function(){
		  
		  cordovaUtil.getCoordinates();
	  }

    $scope.fetch = function(){
      if(config.cordova)
        cordovaUtil.showToastMessage("Sync started");
      console.log("Syncing")
      cordovaUtil.batchSync();
    }

    $scope.openSignupForm = function(){
      $state.go('signup.stepOne');
    }
	  


  /*  $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    }); */
  });
