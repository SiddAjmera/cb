'use strict';

angular.module('cbApp')
  .controller('UserProfileCtrl', function ($scope, $state, Auth, $modal, cordovaUtil, $cordovaImagePicker, httpRequest, staticData) {
    $scope.message = 'Hello';
    $scope.editableMode = false;
    
    Auth.getCurrentUser().
     then(function(data){
        $scope.user = data;
     });

    $scope.leftButtonText = "EDIT";
    $scope.rightButtonText = "LOGOUT";

    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.timeSlotJSON = [
                            {'start':'8:00 AM','end':'5:00 PM'},
                            {'start':'9:00 AM','end':'6:00 PM'},
                            {'start':'10:00 AM','end':'7:00 PM'},
                            {'start':'11:00 AM','end':'8:00 PM'},
                            {'start':'12:00 AM','end':'9:00 PM'},                                
                          ];

    $scope.operation = function(buttonText){
      if(buttonText == "EDIT"){
        $scope.leftButtonText = "UPDATE";
        $scope.rightButtonText = "CANCEL";
        $scope.editableMode = true;
        $scope.user.homeAddress = $scope.user.homeAddressLocation.display_address;
      }
      else if(buttonText == "LOGOUT"){
        Auth.logout();
        $state.go("login");
      }
      else if(buttonText == "UPDATE"){
        // Update
        alert("UPDATE Called");
        saveDetails();
        $scope.editableMode = false;
      }
      else if(buttonText == "CANCEL"){
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";
        $scope.editableMode = false;
      }
    };

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
           	$scope.user.homeAddress = address.homeAddress;
            $scope.user.city = address.city;
            $scope.user.zipcode = address.zipcode;
            $scope.user.placeID = address.placeID;
          })
        });
    };
    
    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }

    /*$scope.logout = function(){
      if($scope.logoutButtonText=="CANCEL")
        $scope.changeMode();
      else{
        Auth.logout();
        $state.go("login")
      }
    }*/

    $scope.getImageSaveContact = function() {       
            // Image picker will load images according to these settings
            var options = {
                maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                width: 800,
                height: 800,
                quality: 80            // Higher is better
            };
 
            $cordovaImagePicker.getPictures(options).then(function (results) {
                // Loop through acquired images
                for (var i = 0; i < results.length; i++) {
                    $scope.selectedImage = results[i];   // We loading only one image so we can use it like this
 
                    window.plugins.Base64.encodeFile($scope.selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                        $scope.selectedImage = base64;
                        console.log($scope.selectedImage)
                    });
                }
            }, function(error) {
                console.log('Error: ' + JSON.stringify(error));    // In case of error
            });
        };

    $scope.syncUserLocationData = function(){
    	cordovaUtil.syncCoordinates();
    };


    $scope.saveDetails=function () {
      var obj = {};
      
      obj.contactNo = $scope.user.contactNo;

      obj.homeAddressLocation = {};
      obj.homeAddressLocation.display_address = $scope.user.homeAddress.name;
      obj.homeAddressLocation.formatted_address = $scope.user.homeAddress.formatted_address;
      obj.homeAddressLocation.icon = $scope.user.homeAddress.icon;
      obj.homeAddressLocation.placeId = $scope.user.homeAddress.place_id;
      obj.homeAddressLocation.location = [];
      obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lng());
      obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lat());

      obj.officeAddressLocation = $scope.user.officeAddress;

      obj.vehicle = [];
      var vehicle = {};
      vehicle.vehicleLicenseNumber = $scope.user.vehicle[0].vehicleLicenseNumber;
      vehicle.capacity = $scope.user.vehicle[0].capacity;
      obj.vehicle.push(vehicle);

      obj.shiftTimeIn = $scope.user.shiftTimeIn;

      obj.shiftTimeout = $scope.user.shiftTimeout;

      for(var i=0, len = $scope.user.homeAddress.address_components.length; i < len; i++) {
          var ac = $scope.user.homeAddress.address_components[i];
          console.log(ac);
          if(ac.types.indexOf("administrative_area_level_2") >= 0) obj.city = ac.long_name;
          if(ac.types.indexOf("administrative_area_level_1") >= 0) obj.state = ac.long_name;
          if(ac.types.indexOf("postal_code") >= 0) obj.zipcode = ac.long_name;
      }

      console.log("Final Updated User Object : ", obj);

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
    };


  });
