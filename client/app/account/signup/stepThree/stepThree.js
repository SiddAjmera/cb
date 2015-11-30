'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup.stepThree', {
        url: '/stepThree',
        templateUrl: 'app/account/signup/stepThree/stepThree.html',
        controller: 'SignupCtrl'
      });
  });
