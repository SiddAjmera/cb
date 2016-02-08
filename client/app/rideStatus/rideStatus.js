'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.rideStatus', {
        url: '/rideStatus',
        templateUrl: 'app/rideStatus/rideStatus.html',
        controller: 'RideStatusCtrl'
      });
  });