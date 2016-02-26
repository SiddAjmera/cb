'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('currentRide', {
        url: '/currentRide',
        templateUrl: 'app/currentRide/currentRide.html',
        controller: 'CurrentRideCtrl'
      });
  });
