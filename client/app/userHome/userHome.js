'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome', {
        url: '/userHome',
        templateUrl: 'app/userHome/userHome.html',
        controller: 'UserHomeCtrl',
        authenticate:true
      });
  });
