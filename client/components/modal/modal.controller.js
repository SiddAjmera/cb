'use strict';

angular.module('cbApp')
  .controller('ModalCtrl', function ($scope, $modalInstance) {
    $scope.message = 'Hello';

    $scope.homeAddressModalOk = function(){
    	
    	$modalInstance.close();
    };

    $scope.homeAddressModalCancel = function(){
    	
    	$modalInstance.close();
    };

    
  });