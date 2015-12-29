'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('suggestions', {
        url: '/suggestions',
        templateUrl: 'app/suggestions/suggestions.html',
        controller: 'SuggestionsCtrl'
      });
  });