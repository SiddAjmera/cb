'use strict';

angular.module('cbApp')
  .controller('MapCtrl', [ '$scope', 'cordovaUtil' ,function ($scope,cordovaUtil) {
     $scope.startTracking=function(){
		  
		  cordovaUtil.getCoordinates();
	  }

	  
  }]);
