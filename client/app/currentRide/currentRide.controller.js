'use strict';

angular.module('cbApp')
  .controller('CurrentRideCtrl', function ($scope) {
    $scope.message = 'Hello';

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };
  });
