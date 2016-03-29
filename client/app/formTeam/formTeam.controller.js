'use strict';

angular.module('cbApp')
  .controller('FormTeamCtrl', function ($scope, $state, Auth, staticData, httpRequest) {
    $scope.message = 'Hello';
    var routes;
    
    var fromLocation = [];
    var toLocation = [];
    var from, to;

    var directionsService = new google.maps.DirectionsService();

    $scope.officeAddressJSON = staticData.getTCSLocations();

    $scope.$on('leafletDirectivePath.analyzeon.mousedown', function(event, path){
        console.log("%cGot leafletObject Message : " + path.leafletObject.options.message,"color:green;");
        $scope.routeSummary = path.leafletObject.options.message;
    });

    $scope.$on('leafletDirectivePath.analyzeon.click', function(event, path){
        console.log("%cGot path as : "+path,"background-color:green");
        console.log("Got leafletObject Message : ", path.leafletObject.options.message);
        $scope.routeSummary = path.leafletObject.options.message;
    });

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

    $scope.mypath = {};
    var getRoute = function (from, to) {
        var request = {};
        request.optimizeWaypoints = true;
        request.provideRouteAlternatives = true;
        request.travelMode = google.maps.TravelMode.DRIVING;
        request.origin = from;
        request.destination = to;
        console.log("Request Object to Direction Service : ", request);
        directionsService.route(request, function(response, status) {
            console.log("response",response)
            if (status == google.maps.DirectionsStatus.OK) {
                
                //var routes = _.map(response.routes,function(r){return r.overview_polyline});

                routes = _.map(response.routes,function(r){

                    console.log("r : ", r);
                    console.log("r.summary : ", r.summary);

                    return  {
                                polyline: r.overview_polyline,
                                via: r.summary
                            }
                });

                console.log("routes",routes);              
                angular.forEach(routes,function(r,key){
                    var routeObj = {};
                    routeObj.color = '#'+Math.floor(Math.random()*16777215).toString(16);
                    routeObj.weight = 8;
                    routeObj.latlngs = L.Polyline.fromEncoded(r.polyline).getLatLngs();
                    routeObj.clickable = true;
                    routeObj.message = r.via;
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

    $scope.team = {};
    $scope.team.teamName = "Morning Commute";
    $scope.team.rideDetails = {};
    $scope.team.rideDetails.from = {};
    $scope.team.rideDetails.to = {};

    var currentUser = {};
	Auth.getCurrentUser(true)
    	.then(function(data){
        	$scope.user = data;
            
            if($scope.user.homeAddressLocation){
                $scope.team.rideDetails.from = $scope.user.homeAddressLocation;
                fromLocation.push($scope.team.rideDetails.from.location[1]);
                fromLocation.push($scope.team.rideDetails.from.location[0]);
                from = fromLocation.join();
            }
            
            if($scope.user.officeAddressLocation){
                $scope.team.rideDetails.to = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
                toLocation.push($scope.team.rideDetails.to.location[1]);
                toLocation.push($scope.team.rideDetails.to.location[0]);
                to = toLocation.join();
            }
            if($scope.user.shiftTimeIn) $scope.team.rideDetails.ridePreferredTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
            if(from && to) getRoute(from, to);
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

            fromLocation.push($scope.team.rideDetails.from.location[1]);
            fromLocation.push($scope.team.rideDetails.from.location[0]);
            from = fromLocation.join();
            to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            if(from && to) getRoute(from, to);
        }
    });

    $scope.$watch('team.rideDetails.to', function(newValue, oldValue, scope) {
        if(newValue != oldValue){
            toLocation.push($scope.team.rideDetails.to.location[1]);
            toLocation.push($scope.team.rideDetails.to.location[0]);
            from = fromLocation.join();
            to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            if(from && to) getRoute(from, to);
        }
    });

    $scope.findTeamMembers = function(){
        var teamObject = {};
        teamObject.team = $scope.team;
        teamObject.team.rideDetails.ridePreferredTimeHToO = $scope.team.rideDetails.ridePreferredTime.start;
        teamObject.team.rideDetails.ridePreferredTimeOToH = $scope.team.rideDetails.ridePreferredTime.end;
        teamObject.team.rideDetails.routeSummary = $scope.routeSummary;
        console.log("Final Team Object Before Find Team Memebers : ", teamObject);

        //For the case when the User directly visits the Form Team Page.
        var url = config.apis.signup + $scope.user._id;
        if(!$scope.user.homeAddressLocation && !scope.user.officeAddressLocation){
            var obj = {};
            obj.homeAddressLocation = $scope.team.rideDetails.from;
            obj.officeAddressLocation = $scope.team.rideDetails.to;
            obj.shiftTimeIn = $scope.team.rideDetails.ridePreferredTime.start;
            obj.shiftTimeout = $scope.team.rideDetails.ridePreferredTime.end;
            httpRequest.post(url, obj)
                       .then(function(data){
                            if(data.status === 200){
                                if(config.cordova) cordovaUtil.showToastMessage('Your information has been stored successfully.');
                                else alert('Your information has been stored successfully.');
                            }
                       });

        }

        $state.go('userHome.suggestions', {'team': teamObject});
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  });