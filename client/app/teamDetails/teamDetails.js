'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teamDetails', {
      	templateUrl: 'app/teamDetails/teamDetails.html',
      	params: {'teamId': null, 'team': null},
      	controller: 'TeamDetailsCtrl'
      });
});