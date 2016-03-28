'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.suggestions', {
        /*url: '/suggestions',*/
        templateUrl: 'app/suggestions/suggestions.html',
        controller: 'SuggestionsCtrl',
        params: {'team': null},
        authenticate:true
      });
  });