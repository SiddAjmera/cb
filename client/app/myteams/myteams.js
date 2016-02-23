'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myteams', {
        url: '/myteams',
        templateUrl: 'app/myteams/myteams.html',
        controller: 'MyteamsCtrl'
      });
  });
