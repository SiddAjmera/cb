'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.userProfile', {
        url: '/userProfile',
        templateUrl: 'app/userProfile/userProfile.html',
        controller: 'UserProfileCtrl',
         authenticate:true
      });
  });