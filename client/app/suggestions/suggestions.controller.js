'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', function ($scope, leafletMarkerEvents, $timeout) {
   
        


    $scope.markers= [];
    $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };
    var tempObj = {};
    tempObj.lat = 18.581904504725568;
    tempObj.lng = 73.68483066558838;
    tempObj.enable=['click','touch'];
    /*tempObj.layer="Options";*/
    tempObj.icon= {
                        type: 'div',
                        iconSize: [25, 60],
                        popupAnchor:  [0, -50],
                        iconAnchor:   [10, 45],
                        html: '<img class="map-user-marker" src="assets/images/user-image.jpg">'  
                 }
    tempObj.message='<div class="cn-wrapper" id="cn-wrapper"><ul>   <li><a onclick="document.location="tel:4111111"" ><img class="calling-icon-map" src="assets/images/map-icons/icon_call.png"></a></li> <li><a href="#"><img src="assets/images/map-icons/icon_contact_rollover.png"></a></li> <li><a href="#"><img src="assets/images/map-icons/icon_favorite.png"></a></li>  <li><a href="#"><img class="add-icon-map" src="assets/images/map-icons/icon_add.png"></a></li>  </ul></div>';
    $scope.markers.push(tempObj)
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