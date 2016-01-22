'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope,httpRequest,Auth,cordovaUtil,staticData) {


    //Multiple Routes Code - start


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



    //Temp Code for Route

    // var map = new L.Map('map');

    //var polyline = L.Polyline.fromEncoded("crnsBqtz{LuCc@_Ba@k@[a@a@SCe@?u@?YKy@m@O[ESAa@EK]Qo@OmAQo@A?WDUXm@Fe@Ug@MQEUgCZQm@e@_AGM?MBu@AYUk@c@a@MQACm@Q_BWe@GQxAQh@QRIPGx@@j@Dp@Fl@ALMVc@b@MHMBk@CKDK?wDwAe@hAUv@SnA?RNlABfB@r@Cb@E~ANxEAhAIr@Id@mAxDAJ@L@Lc@IoAWcAKi@KgAW_CCy@FsAXwAFmE?iCG_BQiAUcA[k@nBEj@D|DDpAJZGxAGZu@|Cg@rACNH~@Cz@Gj@fA`@\LZ`@sApEQFSJKFEN]pAY^eJBCpAd@?t@BfG?LTJVDlDOj@BjDLv@Ar@Er@?b@Fv@Gd@eC?e@HkBFc@POJMPIf@@vFFjFQf@R|GAvC`@tOFvB\`EbArGZ|BFr@DtAHlIc@jKNvALh@Tf@Zh@fAdArAn@zA|@bA\|Ad@bAf@vAb@f@CrLtC|D~@vC}F");
    //var lats = polyline.getLatLngs();
    var latArr = [];
    //latArr.push(lats);
    //latArr.push(L.Polyline.fromEncoded("crnsBqtz{LuCc@_Ba@k@[a@a@SCe@?u@?YKy@m@O[ESAa@EK]Qo@OmAQo@A?WDUXm@Fe@Ug@MQEUgCZQm@e@_AGM?MBu@AYUk@c@a@MQACm@Q_BWe@GQxAQh@QRIPGx@@j@Dp@Fl@ALMVc@b@MHMBk@CKDK?wDwAe@hAUv@SnA?RNlABfB@r@Cb@E~ANxEAhAIr@Id@mAxDAJ@L@Lc@IoAWcAKi@KgAW_CCy@FsAXwAFmE?iCG_BQiAUcA[k@nBEj@D|DDpAJZGxAGZu@|Cg@rACNH~@Cz@Gj@fA`@\LZ`@sApEQFSJKFEN]pAY^eJBCpAd@?t@BfG?LTJVDlDOj@BjDLv@Ar@Er@?b@Fv@Gd@eC?e@HkBFc@POJMPIf@@vFFjFQf@R|GAvC`@tOFvB\`EbArGZ|BFr@DtAHlIc@jKNvALh@Tf@Zh@fAdArAn@zA|@bA\|Ad@bAf@vAb@f@CrLtC|D~@vC}F").getLatLngs());
    //latArr.push(L.Polyline.fromEncoded("crnsBqtz{LuCc@_Ba@k@[a@a@SCe@?u@?YKy@m@O[ESAa@EK]Qo@OmAQo@A?WDUXm@Fe@Ug@MQEUgCZQm@e@_AGM?MBu@AYUk@c@a@MQACm@Q_BWe@GQxAQh@QRIPGx@@j@Dp@Fl@ALMVc@b@MHMBk@CKDK?wDwAuD_B]GcCOu@GkBOcASa@Ku@]gBo@aDaAUp@G@[KMCwAF{ABCCG[{CSk@uB{At@a@V}@r@i@h@y@`AuBrCg@p@wBzCoCbFQXq@xA_ArAg@d@{ClCw@l@cE~CY`@e@t@Wr@Ul@Kj@KvAI`FMhB_@vB_ApDyAdFw@`DuB~HjEpAlC~@fGnBlBn@n@L\DpIA^ILIP_@AwG@WJ[NWROZId@?nDVRJJJjBMZATPNP@FDpBD`G@tFD~ACRMRm@ZiBAm@DW@uA?s@?[DWJOLU^Il@@hG^rKDjBA|AFbE\pML|BRtB^jCp@hETnBN~KGdB[vF?p@Dl@N~@\z@Zh@b@d@b@^l@Z`CpA`DbApBz@h@Nf@CtP`Ez@Rv@{ApAgCLY").getLatLngs());
    //latArr.push(L.Polyline.fromEncoded("konpBstkaMrCf@AF_@dCEDGAoCe@GCCWOKk@KKfAMnA[nDY|BUdAQf@yCbGBBBF?B?@|AzAhJjJ~BlCfAu@xDmDnDgDhC}BlE_E~@eAvC}DxBwCbAwB`B{DbCkFbCeF|C_FrAiBjC{ChBuBj@k@rOqP|IoJz@kAZoAf@i@nBeB|@_@l@c@|LaLx@q@~CuCnCcBrBcAvAw@~CgBZ[Vc@v@mFRmAJ[PWRORI~@OhFO^CfBg@`FmAvAe@fDoAlDgAxBo@jA_@|CmAdAk@rA_AlQgMxLaIrGcEjKcHfGuD~HoF~JqGpJkGnIwF|B}AfA{@l@u@tAaC|DuGlB_DfFiIzCcFhA{AbGaIxBeDjD}EzA_Cx@mApAaCn@}@xKsQr@kARi@ZyAbAaFpAqHVcB\gCnBeL^gB\sBX_BBq@VqAf@eEBUAIg@gA[a@OM[]Yk@Q{@Cu@I_BES_@ZeBdByCxCMLW]c@i@S]Wq@s@eGeA_KAs@RyC@cBEeBIc@uCqEe@k@]U_@K{A_@}Bq@wFaC}@i@y@u@mDgGs@y@o@k@}@u@}@}@][g@c@eAmAWa@{@gBi@wAm@mBw@_EoCeQg@sCiD{K}BqH_@w@a@]oD{Bs@e@WMNS~@{Ah@y@fB}CNs@Bo@Gs@i@sBUeASsBQyA[oAm@}Ao@mAc@oAYiBEgA?c@^eC?Qc@uDu@yFkAcJk@{Bi@uAi@{@gBaCuAyAiC}BeDwCiBsAqBaBqEgFeBcC{@_Bq@uAM]Ke@_@aBQeA_BiH[mB{BwJs@yC_@sB_BgJ_BmGi@}A[g@y@w@u@_Aa@g@}@kAcAaBkDiGu@{Am@wAsAkEs@{C[cB{@wDyC{K[yAScASHOBiDZ").getLatLngs());

    


    var directionsService = new google.maps.DirectionsService();

    var request = {
          origin: "37.891586,-4.7844853",
          destination: "38.891586,-5.7844853",
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        };

    directionsService.route(request, function(response, status) {
        console.log("response",response)
          if (status == google.maps.DirectionsStatus.OK) {
              var routes = _.map(response.routes,function(r){return r.overview_polyline});
              console.log("routes",routes);
              
              angular.forEach(routes, function (r, key) {
                  latArr = L.Polyline.fromEncoded(r).getLatLngs();
              });
              
              $scope.mypath = {};
             $scope.mypath.polyline={type:"polyline",latlngs:latArr}
                    console.log($scope.mypath);
            //directionsDisplay.setDirections(response);            
            console.log('enter!');  
          }
        });
        
       var latArr=L.Polyline.fromEncoded("konpBstkaMrCf@AF_@dCEDGAoCe@GCCWOKk@KKfAMnA[nDY|BUdAQf@yCbGBBBF?B?@|AzAhJjJ~BlCfAu@xDmDnDgDhC}BlE_E~@eAvC}DxBwCbAwB`B{DbCkFbCeF|C_FrAiBjC{ChBuBj@k@rOqP|IoJz@kAZoAf@i@nBeB|@_@l@c@|LaLx@q@~CuCnCcBrBcAvAw@~CgBZ[Vc@v@mFRmAJ[PWRORI~@OhFO^CfBg@`FmAvAe@fDoAlDgAxBo@jA_@|CmAdAk@rA_AlQgMxLaIrGcEjKcHfGuD~HoF~JqGpJkGnIwF|B}AfA{@l@u@tAaC|DuGlB_DfFiIzCcFhA{AbGaIxBeDjD}EzA_Cx@mApAaCn@}@xKsQr@kARi@ZyAbAaFpAqHVcB\gCnBeL^gB\sBX_BBq@VqAf@eEBUAIg@gA[a@OM[]Yk@Q{@Cu@I_BES_@ZeBdByCxCMLW]c@i@S]Wq@s@eGeA_KAs@RyC@cBEeBIc@uCqEe@k@]U_@K{A_@}Bq@wFaC}@i@y@u@mDgGs@y@o@k@}@u@}@}@][g@c@eAmAWa@{@gBi@wAm@mBw@_EoCeQg@sCiD{K}BqH_@w@a@]oD{Bs@e@WMNS~@{Ah@y@fB}CNs@Bo@Gs@i@sBUeASsBQyA[oAm@}Ao@mAc@oAYiBEgA?c@^eC?Qc@uDu@yFkAcJk@{Bi@uAi@{@gBaCuAyAiC}BeDwCiBsAqBaBqEgFeBcC{@_Bq@uAM]Ke@_@aBQeA_BiH[mB{BwJs@yC_@sB_BgJ_BmGi@}A[g@y@w@u@_Aa@g@}@kAcAaBkDiGu@{Am@wAsAkEs@{C[cB{@wDyC{K[yAScASHOBiDZ").getLatLngs();
              
              
            /*  $scope.mypath = {};
              $scope.mypath.polyline={type:"polyline",latlngs:latArr}
            */  
                    
            //directionsDisplay.setDirections(response);            
            console.log('enter!'); 
    //Multiple Routes Code - end


    $scope.message = 'Hello';
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
