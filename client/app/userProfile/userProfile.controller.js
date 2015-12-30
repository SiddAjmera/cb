'use strict';

angular.module('cbApp')
  .controller('UserProfileCtrl', function ($scope, $modal, cordovaUtil) {
    $scope.message = 'Hello';


    $scope.getLocation=function(){
         var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'components/modal/modal.html',
          controller: 'ModalCtrl',
          size: 'sm'
        });
        
        modalInstance.result.then(function(option){
          if(option == "yes")
          cordovaUtil.getUserHomeCoordinates().then(function(address){
          	alert('Promise was returned successfully. Address is : ' + address);
           	$scope.user.homeAddress=address.homeAddress;
            $scope.user.city=address.city;
            $scope.user.zipcode=address.zipcode;
            $scope.user.placeID=address.placeID;
          })
        });
    };

    $scope.syncUserLocationData = function(){
    	cordovaUtil.syncCoordinates();
    };

  });
