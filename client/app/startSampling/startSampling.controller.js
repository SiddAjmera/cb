'use strict';

angular.module('cbApp')
  .controller('StartSamplingCtrl', function ($scope, cordovaUtil) {
    $scope.message = 'Hello';
    $scope.buttonText="START SAMPLING";

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
});