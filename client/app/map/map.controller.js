'use strict';

angular.module('cbApp')
  .controller('MapCtrl', function ($scope,cordovaUtil) {
     $scope.startTracking=function(){
		  
		  cordovaUtil.getCoordinates();
	  }

	  
  });
