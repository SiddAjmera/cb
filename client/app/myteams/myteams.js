'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myteams', {
        url: '/myteams',
        templateUrl: '../y/myteams/myteams.html',
        controller: 'MyteamsCtrl'
      });
  });
