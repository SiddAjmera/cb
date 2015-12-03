'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.availableRides', {
        url: '/availableRides',
        templateUrl: 'app/availableRides/availableRides.html',
        controller: 'AvailableRidesCtrl'
      });
  });
