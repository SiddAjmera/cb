'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.rideDetails', {
        url: '/rideDetails',
        templateUrl: 'app/rideDetails/rideDetails.html',
        controller: 'RideDetailsCtrl'
      });
  });
