'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope, httpRequest, Auth, cordovaUtil, staticData, $state) {
    var directionsService = new google.maps.DirectionsService();
    
    $scope.rideData = {};
    $scope.rideData.from = 'Home';
    $scope.rideData.to = 'Office';
    $scope.rideData.leavingIn = '15';
    $scope.rideData.availableSeats = 1;
    
    $scope.mypath = {};
    var getRoute = function (from, to) {
        var request = {};
        request.optimizeWaypoints = true;
        request.provideRouteAlternatives = true;
        request.travelMode = google.maps.TravelMode.DRIVING;
        request.origin = from;
        request.destination = to;
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var routes = _.map(response.routes,function(r){return r.overview_polyline});
                console.log("routes",routes);              
                angular.forEach(routes,function(r,key){
                    var routeObj = {};
                    routeObj.color = '#'+Math.floor(Math.random()*16777215).toString(16);
                    routeObj.weight = 4;
                    routeObj.latlngs = L.Polyline.fromEncoded(r).getLatLngs();
                    routeObj.clickable = true;
                    $scope.mypath['r'+key] = routeObj; 
                  //latArr.push(L.Polyline.fromEncoded(r).getLatLngs());
                });              
               //$scope.mypath ={};
               //$scope.mypath.multiPolyline={type:"multiPolyline",latlngs:latArr};
                console.log('in req ',$scope.mypath);                
                console.log('enter!');  
            }
        }); 
    }
    
    var currentUser;
    Auth.getCurrentUser().
    then(function(data){
        currentUser = data;
        console.log('Current User : ', currentUser);

        var maxAvailableSeats = currentUser.vehicle[0].capacity - 1;

        $scope.availableSeatsJSON = [];
        for(var i=1; i <= maxAvailableSeats; i++){
            $scope.availableSeatsJSON.push(i.toString());
        }

        $scope.rideData.availableSeats = (currentUser.vehicle[0].capacity - 1).toString();
        console.log("$scope.rideData.availableSeats : ", $scope.rideData.availableSeats);

        console.log("$scope.rideData",$scope.rideData);
        
        var fromLocation = [];
        fromLocation.push(currentUser.homeAddressLocation.location[1]);
        fromLocation.push(currentUser.homeAddressLocation.location[0]);
        var toLocation = [];
        toLocation.push(currentUser.officeAddressLocation.location[1]);
        toLocation.push(currentUser.officeAddressLocation.location[0]);
                
        var from = fromLocation.join();
        var to = toLocation.join();
        getRoute(from, to);
    });

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }

    
    //Multiple Routes Code - start
    $scope.$watch('rideData.to', function(newValue, oldValue, scope) {
        if(currentUser){
            if(newValue == "Home"){
                var fromLocation = [];
                fromLocation.push(currentUser.officeAddressLocation.location[1]);
                fromLocation.push(currentUser.officeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.homeAddressLocation.location[1]);
                toLocation.push(currentUser.homeAddressLocation.location[0]);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                getRoute(from, to);
            }
            else{
                var fromLocation = [];
                fromLocation.push(currentUser.homeAddressLocation.location[1]);
                fromLocation.push(currentUser.homeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.officeAddressLocation.location[1]);
                toLocation.push(currentUser.officeAddressLocation.location[0]);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                getRoute(from, to);
            }
        }
    });

    $scope.$watch('rideData.from', function(newValue, oldValue, scope) {
        if(currentUser){
            if(newValue == "Home"){
                var fromLocation = [];
                fromLocation.push(currentUser.homeAddressLocation.location[1]);
                fromLocation.push(currentUser.homeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.officeAddressLocation.location[1]);
                toLocation.push(currentUser.officeAddressLocation.location[0]);
                console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                console.log("From is " + from + " and to is " + to);
                getRoute(from, to);
            }
            else{
                var fromLocation = [];
                fromLocation.push(currentUser.officeAddressLocation.location[1]);
                fromLocation.push(currentUser.officeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.homeAddressLocation.location[1]);
                toLocation.push(currentUser.homeAddressLocation.location[0]);
                console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                console.log("From is " + from + " and to is " + to);
                getRoute(from, to);
            }
        }
    });

    console.log("$scope.rideData",$scope.rideData);

    $scope.defaults = {
      minZoom:0,
      maxZoom:22,
      tap:true,
      tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    };

    $scope.center = {
      lat : 18.581904504725568,
      lng : 73.68483066558838,
      zoom: 15
    };
    var latArr = [];
    
    var request = {
          origin: "37.891586,-4.7844853",
          destination: "38.891586,-5.7844853",
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        };

   
    //Multiple Routes Code - end
    $scope.ride = {};
    /*get tcs locations*/   
    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.showErrorMessage = false;
    $scope.leavingInJSON =  [
                                {"text":"05 MIN","value":"5"},
                                {"text":"10 MIN","value":"10"},
                                {"text":"15 MIN","value":"15"},
                                {"text":"20 MIN","value":"20"},
                                {"text":"25 MIN","value":"25"},
                                {"text":"30 MIN","value":"30"},
                                {"text":"35 MIN","value":"35"},
                                {"text":"40 MIN","value":"40"},
                                {"text":"45 MIN","value":"45"},
                                {"text":"50 MIN","value":"50"},
                                {"text":"55 MIN","value":"55"},
                                {"text":"60 MIN","value":"60"},
                            ];

    $scope.autocompleteOptions = {
                        types: ['(cities)'],
                        componentRestrictions: { country: 'IN',city:'Pune' },
                    }

    
    $scope.fromChanged = function(option){
        (option == "Home") ? $scope.rideData.to = "Office" : $scope.rideData.to = "Home";
    }

    $scope.toChanged = function(option){
        (option == "Home") ? $scope.rideData.from = "Office" : $scope.rideData.from = "Home";
    }

    $scope.address='default'
    $scope.addressTo='default'
    $scope.optionAddressOptions=function(option){
        $scope.open=option;
        if(option=="from") $scope.ride.source=undefined;
        else $scope.ride.destination=undefined;
    }
     $scope.showAddressFrom=function(option){
        console.log(option)
        $scope.address = option;
        if($scope.address == "home") $scope.ride.source = currentUser.homeAddress;
        $scope.otherAddress = true;
        $scope.open = false;
    }
    $scope.showAddressTo=function(option){
        console.log(option)
        $scope.addressTo = option;
        if($scope.addressTo == "homeTo") $scope.ride.destination= currentUser.homeAddress;
        $scope.otherAddress = true;
        $scope.open = false;
    }
    $scope.postRide = function(){
        console.log("ride object",$scope.ride);
        var ride = {};
        if($scope.rideData.from=="Other"){
            ride.startLocation = {
                                    formatted_address:$scope.ride.source.formatted_address,
                                    display_address : $scope.ride.destination.name,
                                    location:[$scope.ride.source.geometry.location.lng(),$scope.ride.source.geometry.location.lat()],
                                    placeId:$scope.ride.source.place_id,
                                    icon : $scope.ride.source.icon 
                                };
        
        }
        else if($scope.rideData.from == "Home"){
            ride.startLocation = currentUser.homeAddressLocation;
        }
        else if($scope.rideData.from == "Office"){
             ride.startLocation = currentUser.officeAddressLocation;
        }
        if($scope.rideData.to == "Other"){
            ride.endLocation =  {
                                    formatted_address : $scope.ride.destination.formatted_address,
                                    display_address : $scope.ride.destination.name,
                                    location : [$scope.ride.destination.geometry.location.lng(),$scope.ride.destination.geometry.location.lat()],
                                    placeId : $scope.ride.destination.place_id,
                                    icon : $scope.ride.destination.icon 
                                };    
        
        }
        else if($scope.rideData.to == "Home"){
            ride.endLocation = currentUser.homeAddressLocation;
        }
        else if($scope.rideData.to == "Office"){
             ride.endLocation = currentUser.officeAddressLocation;
        }
        ride.initiallyAvailableSeats = $scope.rideData.availableSeats;
        ride.rideScheduledTime = moment().add(parseInt($scope.rideData.leavingIn),"minutes").valueOf();
        ride.vehicleLicenseNumber = currentUser.vehicle[0].vehicleLicenseNumber;
        ride.rideStatus = "ACTIVE";
        console.log("final obj",ride)
        httpRequest.post(config.apis.postRide,{'ride':ride}).
        then(function(data){
            console.log(data);
            if(data.status==201){
                if(config.cordova) cordovaUtil.showToastMessage("Ride posted succesfully!")
                else alert("Ride posted succesfully!");
                $state.go('userHome.rideStatus');
            }  
        },function(err){
            console.log("err",err);

             if(err.status == 409){
                  if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
                  else alert('You are already part of an Active Ride');
                  $state.go('userHome.rideStatus');
            }
        })
    }
});