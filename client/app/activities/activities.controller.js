'use strict';

angular.module('cbApp')
  .controller('ActivitiesCtrl', [ '$scope', '$state', '$stateParams' ,function ($scope, $state, $stateParams) {
    $scope.message = 'Hello';

    $scope.team = $stateParams.team;

    $scope.getTeam = function(_id){
    	$state.go('teamDetails', {'team': $scope.team});
    }

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  }]);