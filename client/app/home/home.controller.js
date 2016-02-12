'use strict';

angular.module('cbApp')
  .controller('HomeCtrl', function ($scope,Auth,httpRequest,filterService) {
     $scope.defaults={minZoom:10, maxZoom:15,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
  
       $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };
    $scope.setCenter=true;
    $scope.paths={};
    var currentUser = {};
     Auth.getCurrentUser().
     then(function(data){
        currentUser = data;
        getDrives(10);
        console.log(currentUser)
     });
    var getLocations = function(driveId){
       $scope.paths = {};
        var filterJSON = {};
        filterJSON.driveId = driveId;
        filterJSON.userId = currentUser.userId;

        httpRequest.post(config.apis.filterLocations,filterJSON).
        then(function(response) {
             console.log("locations",response);
            if(response.status==200 && response.data.length > 0){

                    var pathArr=[];

                    angular.forEach(response.data, function(location, key){
                        pathArr.push({lat:location.location.latitude,lng:location.location.longitude});

                    });
                    console.log("pathArr",pathArr)
                    if($scope.setCenter){
                            $scope.center=pathArr[0];
                            $scope.setCenter=false;
                    }
                     $scope.paths={
                             p1: {
                        color: '#008000',
                        weight: 8,
                        latlngs:pathArr
                        }

                       }
            console.log("filtered data",filterService.GDouglasPeucker(pathArr,20));
            }
           

        })    
        
    }

    $scope.postRide=function () {

    }
    $scope.takeRide=function () {
      
    }

    $scope.toggleFooter = function(){
     
      $(".home-page-menu-options").slideToggle(250);
      
    }

    var drivesArray = [];
    var totalDrives =  0;
    var currentDrive = 0;
    var getDrives = function(limit){
      var postJSON = {}
      postJSON.userId = currentUser.userId;
      postJSON.limit = limit;

      httpRequest.post(config.apis.getDrives,postJSON).
      then(function(drives){
        console.log(drives)
        if(drives.status==200){
           drivesArray = drives.data;
           totalDrives = drives.data.length;
           if(drivesArray.length!=0){

              getLocations(drivesArray[currentDrive]);
              getStats(drivesArray[currentDrive]);
              currentDrive++;
           }
               
        }
         
      })
    }

    $scope.getNextDrive = function(){
      console.log("currentDrive in next",currentDrive);
      currentDrive++;
      if(currentDrive<=totalDrives-1){
        getStats(drivesArray[currentDrive])
        getLocations(drivesArray[currentDrive]);
      }else
        currentDrive--;
    }

    $scope.getPrevDrive = function(){
       console.log("currentDrive in prev",currentDrive);
       currentDrive--;
      if(currentDrive>=0){

        getStats(drivesArray[currentDrive])
        getLocations(drivesArray[currentDrive])

       }else
        currentDrive=0;
    }

    var getStats = function(driveId){
        var filterJSON = {};
        $scope.stats = {}
        filterJSON.driveId = driveId;
        filterJSON.userId = currentUser.userId;

        httpRequest.post(config.apis.getStats,filterJSON).
        then(function(stats){
            if(stats.status==200){
              $scope.stats = stats.data[0];
            }
        })
    }

   
    
  });
