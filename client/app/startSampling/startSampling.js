'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.startSampling', {
        url: '/startSampling',
        templateUrl: 'app/startSampling/startSampling.html',
        controller: 'StartSamplingCtrl',
        authenticate:true
      });
  });