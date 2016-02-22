'use strict';

angular.module('cbApp')
  .controller('RideDetailsCtrl', ['$scope','staticData','Auth','$state','$stateParams','httpRequest'
  	,function ($scope,staticData,Auth,$state,$stateParams,httpRequest) {
  	var forAction=$stateParams.for;
  	console.log("forAction",forAction);
    $scope.message = 'Hello';
    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.timeSlotJSON = [
    							{'start':'8:00 AM','end':'5:00 PM'},
    							{'start':'9:00 AM','end':'6:00 PM'},
    							{'start':'10:00 AM','end':'7:00 PM'},
    							{'start':'11:00 AM','end':'8:00 PM'},
    							{'start':'12:00 AM','end':'9:00 PM'},                                
                          ];
	var currentUser={};
	Auth.getCurrentUser()
    .then(function(data){
        currentUser = data;                
     });                          
    $scope.saveDetails=function () {
    	console.log("$scope.user",$scope.user);
    	var obj = {};
    	obj.vehicle = $scope.user.vehicle;
    	obj.timeSlot = $scope.user.timeSlot;
    	obj.officeAddressLocation = $scope.user.officeAddress;
    	obj.homeAddressLocation = {};
    	obj.homeAddressLocation.display_address = $scope.user.homeAddress.name;
    	obj.homeAddressLocation.formatted_address = $scope.user.homeAddress.formatted_address;
    	obj.homeAddressLocation.icon = $scope.user.homeAddress.icon;
    	obj.homeAddressLocation.placeId = $scope.user.homeAddress.place_id;
    	obj.homeAddressLocation.location = []
    	obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lng());
    	obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lat());

        for(var i=0, len = $scope.user.homeAddress.address_components.length; i < len; i++) {
            var ac = $scope.user.homeAddress.address_components[i];
            console.log(ac);
            if(ac.types.indexOf("administrative_area_level_2") >= 0) obj.city = ac.long_name;
            if(ac.types.indexOf("administrative_area_level_1") >= 0) obj.state = ac.long_name;
            if(ac.types.indexOf("postal_code") >= 0) obj.zipcode = ac.long_name;
        }

    	var url = config.apis.signup + currentUser._id;
    	httpRequest.put(url,obj)
    	.then(function (data) {
    		if(data.status===200){
    			alert('stored');
    			Auth.getCurrentUser(true)
    			.then(function(data){
        			currentUser = data;
        			if(forAction=='postRides'){
        				$state.go('userHome.postRides');
        			}
        			else if(forAction=='takeRide'){
        				$state.go('userHome.availableRides');
        			}
    			});  
    		}
    	})
    }                      
  }]);

