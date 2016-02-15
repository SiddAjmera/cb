'use strict';

angular.module('cbApp')
  .controller('RideDetailsCtrl', ['$scope','staticData','Auth','httpRequest',function ($scope,staticData,Auth,httpRequest) {
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
    	var obj={};
    	obj.vehicle=$scope.user.vehicle;
    	obj.timeSlot=$scope.user.timeSlot;
    	obj.officeAddressLocation=$scope.user.officeAddress;
    	obj.homeAddressLocation={};
    	obj.homeAddressLocation.displayAddress=$scope.user.homeAddress.formatted_address;
    	obj.homeAddressLocation.formatted_address=$scope.user.homeAddress.formatted_address;
    	obj.homeAddressLocation.icon=$scope.user.homeAddress.icon;
    	obj.homeAddressLocation.place_id=$scope.user.homeAddress.place_id;
    	obj.homeAddressLocation.location=[]
    	obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lat());
    	obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lng());

    	var url=config.apis.signup+currentUser._id;
    	httpRequest.put(url,obj)
    	.then(function (data) {
    		if(data.status===200){
    			alert('stored');
    			Auth.getCurrentUser(true)
    			.then(function(data){
        			currentUser = data;                
    			 });  
    		}
    	})
    }                      
  }]);

