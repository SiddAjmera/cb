'use strict';

angular.module('cbApp')
  .controller('RideStatusCtrl', function ($scope) {
    $scope.message = 'Hello';

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };
  });
