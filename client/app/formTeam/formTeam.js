'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('formTeam', {
        url: '/formTeam',
        templateUrl: 'app/formTeam/formTeam.html',
        controller: 'FormTeamCtrl'
      });
  });
