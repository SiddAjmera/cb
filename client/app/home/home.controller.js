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
    var currentUser = Auth.getCurrentUser();
    var getLocations = function(){
        var filterJSON = {};
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
                        latlngs:filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5)
                        }

                       }
            console.log("filtered data",filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5));
            }
           

        })    
        
    }
    getLocations()
  });
