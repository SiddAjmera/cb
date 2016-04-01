'use strict';

angular.module('cbApp')
  .controller('ModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    $scope.message = 'Hello';

    $scope.homeAddressModalOk = function(){
 
    //	cordovaUtil.getUserHomeCoordinates();
    	$modalInstance.close('yes');
    };

    $scope.homeAddressModalCancel = function(){
    	
    	$modalInstance.close();
    };


  }]);