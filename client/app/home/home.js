'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.home', {
        url: '/home',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'

      });
  });
