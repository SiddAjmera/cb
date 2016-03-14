'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('activities', {
        templateUrl: 'app/activities/activities.html',
        params: {'team': null},
        controller: 'ActivitiesCtrl'
      });
  });
