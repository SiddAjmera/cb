'use strict';

angular.module('cbApp')
  .controller('MyteamsCtrl', function ($scope,$state) {
    $scope.message = 'Hello';

    $scope.toggleFooter = function(){
        $(".home-page-menu-options").slideToggle(250);
    }

    $scope.openteamDetails = function(){
    	$state.go('teamDetails');
    }

});
