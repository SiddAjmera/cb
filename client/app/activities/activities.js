'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('activities', {
        url: '/activities',
        templateUrl: 'app/activities/activities.html',
        controller: 'ActivitiesCtrl'
      });
  });
