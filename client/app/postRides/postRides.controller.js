'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope,httpRequest,Auth,cordovaUtil,staticData) {
    var directionsService = new google.maps.DirectionsService();
    var currentUser = {};
    Auth.getCurrentUser().
    then(function(data){
        currentUser = data;
        if($scope.rideData)
            $scope.rideData.availableSeats=(currentUser.vehicle[0].capacity-1).toString();

        console.log("$scope.rideData",$scope.rideData);
    });
    $scope.mypath ={};
    var getRoute =function () {
        var from,to;
        if(angular.isObject($scope.ride.source)){
            from=$scope.ride.source.location.join();
        }
        else if($scope.ride.source && $scope.ride.source!='office'){
            from=currentUser.homeLocationCoordinates.join();   
        }
        else return;

        if(angular.isObject($scope.ride.destination)){
            to=$scope.ride.destination.location.join();
        }
        else if($scope.ride.destination && $scope.ride.destination!='office'){
            to=currentUser.homeLocationCoordinates.join();   
        }
        else return;

        var request = {};
        request.optimizeWaypoints=true;
        request.provideRouteAlternatives=true;
        request.travelMode= google.maps.TravelMode.DRIVING;
        request.origin=from;
        request.destination=to;
        directionsService.route(request, function(response, status) {
            console.log("response",response)
            if (status == google.maps.DirectionsStatus.OK) {
                var routes = _.map(response.routes,function(r){return r.overview_polyline});
                console.log("routes",routes);              
                angular.forEach(routes,function(r,key){
                    var routeObj={};
                    routeObj.color= '#'+Math.floor(Math.random()*16777215).toString(16);
                    routeObj.weight= 2;
                    routeObj.latlngs=L.Polyline.fromEncoded(r).getLatLngs();
                    routeObj.clickable=true;
                    $scope.mypath['r'+key]=routeObj; 
                  //latArr.push(L.Polyline.fromEncoded(r).getLatLngs());
                });              
               //$scope.mypath ={};
               //$scope.mypath.multiPolyline={type:"multiPolyline",latlngs:latArr};
                console.log('in req ',$scope.mypath);                
                console.log('enter!');  
            }
        }); 
    }
    //Multiple Routes Code - start
    $scope.$watch('ride.destination', function(newValue, oldValue, scope) {
        console.log("ride.destination ",newValue);
        getRoute();
    });

    $scope.$watch('ride.source', function(newValue, oldValue, scope) {
        console.log("ride.source ",newValue);   
        getRoute();
    });

    $scope.rideData = {};
    $scope.rideData.from = 'Home';
    $scope.rideData.to = 'Office';
    $scope.rideData.leavingIn = '15';
    $scope.rideData.availableSeats = 4;

    if(currentUser.vehicle)
        $scope.rideData.availableSeats=(currentUser.vehicle[0].capacity-1).toString();
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

    $scope.availableSeatsJSON = [
                                    "1",
            						"2",
            						"3",
            						"4",
            						"5",
            						"6"
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
        if(option=="from")
        $scope.ride.source=undefined;
    else
         $scope.ride.destination=undefined;
    }
     $scope.showAddressFrom=function(option){
        console.log(option)
        $scope.address=option;
        if($scope.address == "home"){
           $scope.ride.source= currentUser.homeAddress           
        }
        $scope.otherAddress=true;
        $scope.open=false;
    }
    $scope.showAddressTo=function(option){
        console.log(option)
        $scope.addressTo=option;
        if($scope.addressTo == "homeTo"){
           $scope.ride.destination= currentUser.homeAddress
        }
        $scope.otherAddress=true;
        $scope.open=false;
    }
    $scope.postRide = function(){
        console.log("ride object",$scope.ride);
        var ride = {};
        if($scope.rideData.from=="Other"){
            ride.startLocation = {
                                    formatted_address:$scope.ride.source.formatted_address,
                                    location:[$scope.ride.source.geometry.location.lat(),$scope.ride.source.geometry.location.lng()],
                                    placeId:$scope.ride.source.place_id,
                                    icon : $scope.ride.source.icon 
                                };
        
        }
        else if($scope.rideData.from=="Home"){
            ride.startLocation = currentUser.homeAddressLocation;
        }
        else if($scope.rideData.from=="Office"){
             ride.startLocation = currentUser.officeAddressLocation;
        }
        if($scope.rideData.to=="Other"){
            ride.endLocation = {
                                    formatted_address:$scope.ride.destination.formatted_address,
                                    location:[$scope.ride.destination.geometry.location.lat(),$scope.ride.destination.geometry.location.lng()],
                                    placeId:$scope.ride.destination.place_id,
                                    icon : $scope.ride.destination.icon 
                             };    
        
        }
        else if($scope.rideData.to=="Home"){
            ride.endLocation = currentUser.homeAddressLocation;
        }
        else if($scope.rideData.to=="Office"){
             ride.endLocation = currentUser.officeAddressLocation;
        }        
       // ride.offeredByUserId = currentUser.empId;
        ride.initiallyAvailableSeats = $scope.rideData.availableSeats;
        ride.rideScheduledTime = moment().add(parseInt($scope.rideData.leavingIn),"minutes").valueOf();
        ride.vehicleLicenseNumber = currentUser.vehicle[0].vehicleLicenseNumber;
        ride.rideStatus = "Active";
        console.log("final obj",ride)
        httpRequest.post(config.apis.postRide,{'ride':ride}).
        then(function(data){
             console.log(data);
            if(data.status==201){
                if(config.cordova)
                    cordovaUtil.showToastMessage("Ride posted succesfully!")
                else
                    alert("Ride posted succesfully!");
            }  
        },function(err){
            console.log("err",err);

             if(err.status==409){
                  if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
                  else alert('You are already part of an Active Ride');
            }
        })
    }
});