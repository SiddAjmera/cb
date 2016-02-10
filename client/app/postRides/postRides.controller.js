'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope,httpRequest,Auth,cordovaUtil,staticData) {
    var directionsService = new google.maps.DirectionsService();
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
    /*latArr=L.Polyline.fromEncoded("konpBstkaMrCf@AF_@dCEDGAoCe@GCCWOKk@KKfAMnA[nDY|BUdAQf@yCbGBBBF?B?@|AzAhJjJ~BlCfAu@xDmDnDgDhC}BlE_E~@eAvC}DxBwCbAwB`B{DbCkFbCeF|C_FrAiBjC{ChBuBj@k@rOqP|IoJz@kAZoAf@i@nBeB|@_@l@c@|LaLx@q@~CuCnCcBrBcAvAw@~CgBZ[Vc@v@mFRmAJ[PWRORI~@OhFO^CfBg@`FmAvAe@fDoAlDgAxBo@jA_@|CmAdAk@rA_AlQgMxLaIrGcEjKcHfGuD~HoF~JqGpJkGnIwF|B}AfA{@l@u@tAaC|DuGlB_DfFiIzCcFhA{AbGaIxBeDjD}EzA_Cx@mApAaCn@}@xKsQr@kARi@ZyAbAaFpAqHVcB\gCnBeL^gB\sBX_BBq@VqAf@eEBUAIg@gA[a@OM[]Yk@Q{@Cu@I_BES_@ZeBdByCxCMLW]c@i@S]Wq@s@eGeA_KAs@RyC@cBEeBIc@uCqEe@k@]U_@K{A_@}Bq@wFaC}@i@y@u@mDgGs@y@o@k@}@u@}@}@][g@c@eAmAWa@{@gBi@wAm@mBw@_EoCeQg@sCiD{K}BqH_@w@a@]oD{Bs@e@WMNS~@{Ah@y@fB}CNs@Bo@Gs@i@sBUeASsBQyA[oAm@}Ao@mAc@oAYiBEgA?c@^eC?Qc@uDu@yFkAcJk@{Bi@uAi@{@gBaCuAyAiC}BeDwCiBsAqBaBqEgFeBcC{@_Bq@uAM]Ke@_@aBQeA_BiH[mB{BwJs@yC_@sB_BgJ_BmGi@}A[g@y@w@u@_Aa@g@}@kAcAaBkDiGu@{Am@wAsAkEs@{C[cB{@wDyC{K[yAScASHOBiDZ").getLatLngs();
        $scope.mypath ={};
        $scope.mypath.polyline={type:"polyline",latlngs:latArr};               
        console.log($scope.mypath);   
        console.log('enter!'); */

    //Multiple Routes Code - start
    $scope.$watch('ride.destination', function(newValue, oldValue, scope) {
        console.log("ride.destination ",newValue);
        getRoute();
    });

    $scope.$watch('ride.source', function(newValue, oldValue, scope) {
        console.log("ride.source ",newValue);   
        getRoute();
    });

    

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
    var currentUser = {};
    Auth.getCurrentUser().
    then(function(data){
        currentUser = data;
        console.log("currentUser",currentUser)
    });

    /*get tcs locations*/
   
    $scope.officeAddressJSON = staticData.getTCSLocations();
    

    $scope.showErrorMessage = false;
    $scope.leavingInJSON =  [
                                {"text":"5 MIN","value":"5"},
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

        if($scope.address=="other"){
            ride.startLocation = {
                                    formatted_address:$scope.ride.source.formatted_address,
                                    location:[$scope.ride.source.geometry.location.lat(),$scope.ride.source.geometry.location.lng()],
                                    placeId:$scope.ride.source.place_id,
                                    icon : $scope.ride.source.icon 
                                };
        
        }else if($scope.address=="home"){
            ride.startLocation = currentUser.homeAddressLocation;
        }
        else if($scope.address=="office"){
             ride.startLocation = $scope.ride.source;
        }
           



        if($scope.addressTo=="otherTo"){
            ride.endLocation = {
                                    formatted_address:$scope.ride.destination.formatted_address,
                                    location:[$scope.ride.destination.geometry.location.lat(),$scope.ride.destination.geometry.location.lng()],
                                    placeId:$scope.ride.destination.place_id,
                                    icon : $scope.ride.destination.icon 
                             };    
        
        }else if($scope.addressTo=="homeTo"){
            ride.endLocation = currentUser.homeAddressLocation;
        }
        else if($scope.addressTo=="officeTo"){
             ride.endLocation = $scope.ride.destination;
        }
        

                     
        ride.comments = $scope.ride.comments
        ride.offeredByUserId = currentUser.userId;
        ride.availableSeats = $scope.ride.availableSeats;
        ride.rideStartTime = moment().add(parseInt($scope.ride.leavingIn),"minutes").valueOf();
        ride.vehicleLicenseNumber = currentUser.vehicle.vehicleNo;
        ride.rideStatus = "Active";
        console.log("final obj",ride)
        httpRequest.post(config.apis.postRide,ride).
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
