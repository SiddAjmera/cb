'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.postRides', {
        url: '/postRides',
        templateUrl: 'app/postRides/postRides.html',
        controller: 'PostRidesCtrl',
        authenticate:"true"
      });
  });
