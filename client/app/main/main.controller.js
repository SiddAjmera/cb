'use strict';

angular.module('cbApp')
  .controller('MainCtrl', function ($scope, $http,$cordovaImagePicker, socket, cordovaUtil, $state, localStorage) {

   
	  
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
      console.log("fetching")
      cordovaUtil.syncCoordinates();
    }

    $scope.openSignupForm = function(){
      $state.go('signup.stepOne');
    }
	  
$scope.getImageSaveContact = function() {       
            // Image picker will load images according to these settings
            var options = {
                maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                width: 800,
                height: 800,
                quality: 80            // Higher is better
            };
 
            $cordovaImagePicker.getPictures(options).then(function (results) {
                // Loop through acquired images
                for (var i = 0; i < results.length; i++) {
                    $scope.selectedImage = results[i];   // We loading only one image so we can use it like this
 
                    window.plugins.Base64.encodeFile($scope.selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                        $scope.selectedImage = base64;
                        console.log($scope.selectedImage)
                    });
                }
            }, function(error) {
                console.log('Error: ' + JSON.stringify(error));    // In case of error
            });
        };

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
