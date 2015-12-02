'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('availableRides', {
        url: '/availableRides',
        templateUrl: 'app/availableRides/availableRides.html',
        controller: 'AvailableRidesCtrl'
      });
  });
