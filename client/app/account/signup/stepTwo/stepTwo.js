'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup.stepTwo', {
        url: '/stepTwo',
        templateUrl: 'app/account/signup/stepTwo/stepTwo.html'
      });
  });
