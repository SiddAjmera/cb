'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', function ($scope, leafletMarkerEvents, $timeout,httpRequest) {
   $scope.defaults={minZoom:10, maxZoom:15,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
     $scope.markers= [];
    var getAllSuggestions = function(){
        httpRequest.get(config.apis.getAllUsers).
        then(function(res){
            console.log("res",res);
            if(res.status==200){
                $scope.suggestedUsers = res.data;

                angular.forEach($scope.suggestedUsers, function(user, key){
                        var tempObj = {};
                        tempObj.lat = parseFloat(user.homeLocationCoordinates[0]);
                        tempObj.lng = parseFloat(user.homeLocationCoordinates[1]);
                        tempObj.enable=['click','touch'];
                        var image = angular.element('<img>',{src:user.userPhotoUrl,'class':'map-user-marker'});
                        console.log(image.outerHTML )
                        /*tempObj.layer="Options";*/
                        tempObj.icon= {
                                            type: 'div',
                                            iconSize: [25, 60],
                                            popupAnchor:  [0, -50],
                                            iconAnchor:   [10, 45],
                                            html: image[0].outerHTML  
                                     }
                        tempObj.message='<user-marker contactno="'+user.contactNo+'"></user-marker';
                        $scope.markers.push(tempObj)
                });
                console.log($scope.markers)
            }
        })
    }    

    getAllSuggestions();

   
    $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };

     var eventNameClick = 'leafletDirectiveMarker.myMap.click';
     var eventNameTouch = 'leafletDirectiveMarker.myMap.touch';
                $scope.$on(eventNameClick, function(event, args){
                    
                $timeout(function(){
                    var  wrapper = document.getElementById('cn-wrapper');
                 classie.add(wrapper, 'opened-nav');
                },100)
                 

                });
                $scope.$on(eventNameTouch, function(event, args){
                    

                  $timeout(function(){
                    var  wrapper = document.getElementById('cn-wrapper');
                 classie.add(wrapper, 'opened-nav');
                },100)
                 

                });
    /*{
            osloMarker: {
                lat: 59.91,
                lng: 10.75,
                message: "I want to travel here!",
                focus: true,
                draggable: false
            }
        }*/


    
  });