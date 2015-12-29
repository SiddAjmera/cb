'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', function ($scope) {
    $scope.center={
        lat: 51.505,
        lng: 10.75,
        zoom: 8
    }
    
    $scope.markers={
            osloMarker: {
                lat: 59.91,
                lng: 10.75,
                message: "I want to travel here!",
                focus: true,
                draggable: false
            }
        }
    
  });