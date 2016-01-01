'use strict';

angular.module('cbApp')
  .controller('StartSamplingCtrl', function ($scope, cordovaUtil,$rootScope,localStorage) {
    $scope.message = 'Hello';
    $scope.buttonText="START SAMPLING";

     $scope.defaults={minZoom:10, maxZoom:15,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }

    $scope.startOrStopSampling = function(value){
    	if(value == "START SAMPLING"){
    		$scope.buttonText="STOP SAMPLING";
    		cordovaUtil.getCoordinates();
    	}
    	else{
    		$scope.buttonText="START SAMPLING";
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
                        pathArr.push( { lat: obj.location.latitude, lng: obj.location.latitude.longitude })
                })
               $scope.center=pathArr[0];
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