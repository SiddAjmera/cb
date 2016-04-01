'use strict';

angular.module('cbApp')
  .controller('UserProfileCtrl', [ '$scope', '$state', 'Auth', '$modal', 'cordovaUtil', '$cordovaImagePicker', 'httpRequest', 'staticData' , function ($scope, $state, Auth, $modal, cordovaUtil, $cordovaImagePicker, httpRequest, staticData) {
    $scope.message = 'Hello';
    $scope.editableMode = false;


    $scope.autocompleteOptions = { componentRestrictions: { country: 'in' } }

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function isEmpty(obj) {

        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    };

    $scope.officeAddressJSON = staticData.getTCSLocations();

    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
   
    $scope.timeSlotJSON = [
                            {'start':'8:00 AM','end':'5:00 PM'},
                            {'start':'9:00 AM','end':'6:00 PM'},
                            {'start':'10:00 AM','end':'7:00 PM'},
                            {'start':'11:00 AM','end':'8:00 PM'},
                            {'start':'12:00 AM','end':'9:00 PM'}
                          ];

    Auth.getCurrentUser()
        .then(function(data){
            $scope.user = data;
            console.log("$scope.user from top block : ", $scope.user);
            if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
            if($scope.user.officeAddressLocation) $scope.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
            if($scope.user.vehicle[0]) $scope.vehicleCapacity = _.findWhere( $scope.vehicleCapacityJSON, $scope.user.vehicle[0].capacity );
            if($scope.user.shiftTimeIn) $scope.shiftTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
        });

    $scope.leftButtonText = "EDIT";
    $scope.rightButtonText = "LOGOUT";

    $scope.$watch('user.contactNo', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.contactNo = newValue;
    });

    $scope.$watch('user.homeAddress', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.homeAddress = newValue;
    });

    $scope.$watch('officeAddress', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.officeAddress = newValue;
    });

    $scope.$watch('user.vehicle[0].vehicleLicenseNumber', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.vehicle[0].vehicleLicenseNumber = newValue;
    });

    $scope.$watch('vehicleCapacity', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.vehicle[0].capacity = newValue;
    });

    $scope.$watch('shiftTime', function(newValue, oldValue, scope) {
      if( newValue != oldValue ){
        $scope.user.shiftTimeIn = newValue.start;
        $scope.user.shiftTimeout = newValue.end;
      }
    });

    $scope.operation = function(buttonText){
      if(buttonText == "EDIT"){
        $scope.leftButtonText = "UPDATE";
        $scope.rightButtonText = "CANCEL";
        $scope.editableMode = true;
      }
      else if(buttonText == "LOGOUT"){
        Auth.logout();
        $state.go("login");
      }
      else if(buttonText == "UPDATE"){
        $scope.saveDetails();
        //$scope.editableMode = false;
        /*if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";*/
      }
      else if(buttonText == "CANCEL"){
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";
        $scope.editableMode = false;
      }
    };

    /*$scope.getLocation=function(){
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
           	$scope.user.homeAddress = address.homeAddress;
            $scope.user.city = address.city;
            $scope.user.zipcode = address.zipcode;
            $scope.user.placeID = address.placeID;
          })
        });
    };*/
    
    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }

  $scope.getImageSaveContact = function() {       
      // Image picker will load images according to these settings
      console.log("Image Picker will open in phone");
      var options = {
          maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
          width: 800,
          height: 800,
          quality: 80            // Higher is better
      };

      if($cordovaImagePicker){
          $cordovaImagePicker.getPictures(options).then(function (results) {
              // Loop through acquired images
              for (var i = 0; i < results.length; i++) {
                  $scope.selectedImage = results[i];   // We loading only one image so we can use it like this

                  window.plugins.Base64.encodeFile($scope.selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                      $scope.selectedImage = base64;
                      console.log($scope.selectedImage);
                      $scope.saveImage();
                  });
              }
          }, function(error) {
              console.log('Error: ' + JSON.stringify(error));    // In case of error
          });
      }
  };

  $scope.saveImage = function(){
      var obj = {};
      obj.userPhotoUrl = $scope.selectedImage;
      var url = config.apis.signup + $scope.user._id;
      httpRequest.put(url,obj)
      .then(function (data) {
        if(data.status === 200){
          if(config.cordova) cordovaUtil.showToastMessage('Profile Image Updated Successfully');
          else alert('Profile Image Updated Successfully');
          Auth.getCurrentUser(true)
          .then(function(data){
              console.log("Data returned : ", data);
              $scope.user = data;
              console.log("$scope.user", $scope.user);
              $scope.user.homeAddress = $scope.user.homeAddressLocation;
              $scope.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
              $scope.shiftTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
              $scope.leftButtonText = "EDIT";
              $scope.rightButtonText = "LOGOUT";
              $state.go('userHome.userProfile');
          });
        }
      });
  };

  $scope.saveDetails=function () {
      var obj = {};
      
      if($scope.userProfileUpdateForm.contactNo.$dirty) obj.contactNo = $scope.user.contactNo;
      if($scope.userProfileUpdateForm.shiftStartTime.$dirty){
        obj.shiftTimeIn = $scope.user.shiftTimeIn;
      }
      if($scope.userProfileUpdateForm.shiftEndTime.$dirty){
        obj.shiftTimeout = $scope.user.shiftTimeout;
      }

      if($scope.userProfileUpdateForm.homeAddress.$dirty){
        if($scope.user.homeAddress.name && $scope.user.homeAddress.formatted_address && $scope.user.homeAddress.geometry && $scope.user.homeAddress.address_components){
          obj.homeAddressLocation = {};
          obj.homeAddressLocation.display_address = $scope.user.homeAddress.name;
          obj.homeAddressLocation.formatted_address = $scope.user.homeAddress.formatted_address;
          obj.homeAddressLocation.icon = $scope.user.homeAddress.icon;
          obj.homeAddressLocation.placeId = $scope.user.homeAddress.place_id;
          obj.homeAddressLocation.location = [];
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

      if($scope.userProfileUpdateForm.officeAddress.$dirty) obj.officeAddressLocation = $scope.officeAddress;


      if($scope.userProfileUpdateForm.vehicleNo.$dirty || $scope.userProfileUpdateForm.availableSeats.$dirty){
        obj.vehicle = [];
        var vehicle = {};
        vehicle.vehicleLicenseNumber = $scope.user.vehicle[0].vehicleLicenseNumber;
        vehicle.capacity = $scope.user.vehicle[0].capacity;
        obj.vehicle.push(vehicle);
      }

      console.log("Final Updated User Object : ", obj);

      if(isEmpty(obj)){
        alert("Nothing to save");
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";
        $scope.editableMode = false;
      }
      else{
        var url = config.apis.signup + $scope.user._id;
        httpRequest.put(url,obj)
        .then(function (data) {
          if(data.status === 200){
            if(config.cordova) cordovaUtil.showToastMessage('Profile Updated Successfully');
            else alert('Profile Updated Successfully');
            Auth.getCurrentUser(true)
            .then(function(data){
                console.log("Data returned : ", data);

                $scope.user = data;
                console.log("$scope.user", $scope.user);

                if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
                if($scope.user.officeAddressLocation) $scope.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
                if($scope.user.vehicle[0]) $scope.vehicleCapacity = _.findWhere( $scope.vehicleCapacityJSON, $scope.user.vehicle[0].capacity );
                if($scope.user.shiftTimeIn) $scope.shiftTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );

                $scope.leftButtonText = "EDIT";
                $scope.rightButtonText = "LOGOUT";
                
                $state.go('userHome.userProfile');
            });
          }
        });
      }
  };




  }]);
