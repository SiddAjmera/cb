'use strict';

angular.module('cbApp')
  .controller('StartSamplingCtrl', function ($scope, cordovaUtil,$rootScope,localStorage) {
    $scope.message = 'Hello';
    $scope.buttonText="START SAMPLING";

     $scope.defaults={minZoom:10, maxZoom:20,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
  $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };
    $scope.setCenter=true;
$scope.paths={};
    $scope.startOrStopSampling = function(value){
    	if(value == "START SAMPLING"){
    		$scope.buttonText="STOP SAMPLING";
            if(config.cordova)
            cordova.plugins.backgroundMode.enable();
    		cordovaUtil.getCoordinates();
    	}
    	else{
    		$scope.buttonText="START SAMPLING";
             if(config.cordova)
            cordova.plugins.backgroundMode.disable();
    		cordovaUtil.stopSampling();
    	}
    };

    $rootScope.$on("locationCaptured",function(){
         localStorage.retrieve('SavedLocationCoordinates').then(function(locations){
                var storedlocations =JSON.parse(locations);
                if(storedlocations==null)
                    return;
               else{
                var pathArr=[];
                storedlocations.TrackedLocations.forEach(function(obj){
                        pathArr.push( { lat: obj.location.latitude, lng: obj.location.longitude })
                })
                if($scope.setCenter){
                    $scope.center=pathArr[0];
                    $scope.setCenter=false;
                }
               
                $scope.paths={
                     p1: {
                color: '#008000',
                weight: 8,
                latlngs:pathArr
                }

               }
           }
            }) 
    })
});