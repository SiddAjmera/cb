'use strict';

angular.module('cbApp')
  .controller('RideDetailsCtrl', ['$scope','staticData','Auth','$state','$stateParams','httpRequest'
  	,function ($scope,staticData,Auth,$state,$stateParams,httpRequest) {
  	var forAction = $stateParams.for;
    $scope.autocompleteOptions = { componentRestrictions: { country: 'in' } }
    $scope.showAutoCompleteErrorMessage = false;
    if(forAction == "takeRide"){
        $scope.hideVehicleDetails = true;
        $scope.pageHeader = 'TAKE RIDE'
    }else{
        $scope.hideVehicleDetails = false;
        $scope.pageHeader = 'POST RIDE';
    }
  	console.log("forAction", forAction);
    $scope.message = 'Hello';
    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.timeSlotJSON =   [
    							{'start':'8:00 AM','end':'5:00 PM'},
    							{'start':'9:00 AM','end':'6:00 PM'},
    							{'start':'10:00 AM','end':'7:00 PM'},
    							{'start':'11:00 AM','end':'8:00 PM'},
    							{'start':'12:00 AM','end':'9:00 PM'}
                            ];
	Auth.getCurrentUser()
        .then(function(data){
            $scope.user = data;
            if(!$scope.user.vehicle){
                $scope.user.vehicle = [];
                var vehicle = {};
                $scope.user.vehicle.push(vehicle);
            }
            if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
            if($scope.user.officeAddressLocation) $scope.user.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
            if($scope.user.shiftTimeIn && $scope.user.shiftTimeout) $scope.user.timeSlot = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
         });

    $scope.saveDetails=function () {
    	console.log("$scope.user",$scope.user);
    	var obj = {};
    	obj.vehicle = $scope.user.vehicle;
    	
        if($scope.userProfileUpdateForm.shiftStartTime.$dirty){
            obj.shiftTimeIn = $scope.user.timeSlot.start;
            obj.shiftTimeout = $scope.user.timeSlot.end;
        }

        if($scope.userProfileUpdateForm.shiftEndTime.$dirty){
            obj.shiftTimeIn = $scope.user.timeSlot.start;
            obj.shiftTimeout = $scope.user.timeSlot.end;
        }

        if($scope.userProfileUpdateForm.officeAddress.$dirty) obj.officeAddressLocation = $scope.user.officeAddress;
        if($scope.userProfileUpdateForm.homeAddress.$dirty){

            if($scope.user.homeAddress.name && $scope.user.homeAddress.formatted_address && $scope.user.homeAddress.geometry){
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
                $scope.userProfileUpdateForm.homeAddress.$setValidity("useautocomplete", true);
            }else{
                $scope.userProfileUpdateForm.homeAddress.$setValidity("useautocomplete", false);
                return false;
            }
        }

    	var url = config.apis.signup + $scope.user._id;
    	httpRequest.put(url,obj)
    	.then(function (data) {
    		if(data.status === 200){
    			alert('Your information has been stored successfully.');
    			Auth.getCurrentUser(true)
    			.then(function(data){
        			$scope.user = data;
        			if(forAction == 'postRides') $state.go('userHome.postRides');
        			else if(forAction == 'takeRide') $state.go('userHome.availableRides');
    			});
    		}
    	})
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  }]);

