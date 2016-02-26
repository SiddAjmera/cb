'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teamDetails', {
        url: '/teamDetails',
        templateUrl: 'app/teamDetails/teamDetails.html',
        controller: 'TeamDetailsCtrl'
      });
  });
