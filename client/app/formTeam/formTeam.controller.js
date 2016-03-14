'use strict';

angular.module('cbApp')
  .controller('FormTeamCtrl', function ($scope, $state, Auth, staticData) {
    $scope.message = 'Hello';

    var directionsService = new google.maps.DirectionsService();

    $scope.officeAddressJSON = staticData.getTCSLocations();

    $scope.timeSlotJSON =   [
    							{'start':'8:00 AM','end':'5:00 PM'},
    							{'start':'9:00 AM','end':'6:00 PM'},
    							{'start':'10:00 AM','end':'7:00 PM'},
    							{'start':'11:00 AM','end':'8:00 PM'},
    							{'start':'12:00 AM','end':'9:00 PM'},                                
                            ];

    $scope.defaults = {
      minZoom:0,
      maxZoom:22,
      tap:true,
      tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    };

    $scope.center = {
      lat : 18.581904504725568,
      lng : 73.68483066558838,
      zoom: 14
    };

    var getRoute = function (from, to) {
        var request = {};
        request.optimizeWaypoints = true;
        request.provideRouteAlternatives = true;
        request.travelMode = google.maps.TravelMode.DRIVING;
        request.origin = from;
        request.destination = to;
        directionsService.route(request, function(response, status) {
            console.log("response",response)
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
    };

    var currentUser = {};
	Auth.getCurrentUser()
    	.then(function(data){
        	$scope.user = data;

            console.log("Here the User that came from the Database : ", $scope.user);

            $scope.team = {};
            $scope.team.teamName = "Morning Commute";
            $scope.team.rideDetails = {};
            $scope.team.rideDetails.from = $scope.user.homeAddressLocation;
            $scope.team.rideDetails.to = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
            $scope.team.rideDetails.ridePreferredTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );

            var fromLocation = [];
            fromLocation.push($scope.user.homeAddressLocation.location[1]);
            fromLocation.push($scope.user.homeAddressLocation.location[0]);
            var toLocation = [];
            toLocation.push($scope.user.officeAddressLocation.location[1]);
            toLocation.push($scope.user.officeAddressLocation.location[0]);
            console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                    
            var from = fromLocation.join();
            var to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            getRoute(from, to);
    	});

    $scope.$watch('team.rideDetails.from', function(newValue, oldValue, scope) {
        if(newValue != oldValue){

            $scope.team.rideDetails.from.display_address = $scope.team.rideDetails.from.name;
            $scope.team.rideDetails.from.formatted_address = $scope.team.rideDetails.from.formatted_address;
            $scope.team.rideDetails.from.icon = $scope.team.rideDetails.from.icon;
            $scope.team.rideDetails.from.placeId = $scope.team.rideDetails.from.place_id;
            $scope.team.rideDetails.from.location = [];
            $scope.team.rideDetails.from.location.push($scope.team.rideDetails.from.geometry.location.lng());
            $scope.team.rideDetails.from.location.push($scope.team.rideDetails.from.geometry.location.lat());

            delete $scope.team.rideDetails.from.address_components;
            delete $scope.team.rideDetails.from.adr_address;
            delete $scope.team.rideDetails.from.geometry;
            delete $scope.team.rideDetails.from.html_attributions;
            delete $scope.team.rideDetails.from.id;
            delete $scope.team.rideDetails.from.name;
            delete $scope.team.rideDetails.from.place_id;
            delete $scope.team.rideDetails.from.reference;
            delete $scope.team.rideDetails.from.reviews;
            delete $scope.team.rideDetails.from.scope;
            delete $scope.team.rideDetails.from.types;
            delete $scope.team.rideDetails.from.url;
            delete $scope.team.rideDetails.from.user_ratings_total;
            delete $scope.team.rideDetails.from.utc_offset;
            delete $scope.team.rideDetails.from.vicinity;
            delete $scope.team.rideDetails.from.__proto__;

            var fromLocation = [];
            fromLocation.push($scope.team.rideDetails.from.geometry.location.lat());
            fromLocation.push($scope.team.rideDetails.from.geometry.location.lng());
            var toLocation = [];
            toLocation.push($scope.user.officeAddressLocation.location[1]);
            toLocation.push($scope.user.officeAddressLocation.location[0]);
            console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                    
            var from = fromLocation.join();
            var to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            getRoute(from, to);
        }
    });

    $scope.$watch('team.rideDetails.to', function(newValue, oldValue, scope) {
        if(newValue != oldValue){
            var fromLocation = [];
            fromLocation.push($scope.user.homeAddressLocation.location[1]);
            fromLocation.push($scope.user.homeAddressLocation.location[0]);
            var toLocation = [];
            toLocation.push($scope.team.rideDetails.to.location[1]);
            toLocation.push($scope.team.rideDetails.to.location[0]);
            console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                    
            var from = fromLocation.join();
            var to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            getRoute(from, to);
        }
    });

    $scope.findTeamMembers = function(){
        var teamObject = {};
        teamObject.team = $scope.team;
        teamObject.team.rideDetails.ridePreferredTimeHToO = $scope.team.rideDetails.ridePreferredTime.start;
        teamObject.team.rideDetails.ridePreferredTimeOToH = $scope.team.rideDetails.ridePreferredTime.end;
        console.log("Final Team Object Before Find Team Memebers : ", teamObject);
        /*alert("This functionality is yet to be implemented");*/

        $state.go('userHome.suggestions', {'team': teamObject});
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  });