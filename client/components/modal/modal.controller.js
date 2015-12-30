'use strict';

angular.module('cbApp')
  .controller('ModalCtrl', function ($scope, $modalInstance, cordovaUtil) {
    $scope.message = 'Hello';

    $scope.homeAddressModalOk = function(){
    	cordovaUtil.getUserHomeCoordinates();
    	$modalInstance.close();
    };

    $scope.homeAddressModalCancel = function(){
    	
    	$modalInstance.close();
    };


  });