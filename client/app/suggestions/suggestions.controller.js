'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', function ($scope, leafletMarkerEvents) {
   
        


    $scope.markers= [];
    $scope.center={
        lat : 59.91,
        lng : 10.75,
        zoom: 4
    };
    var tempObj = {};
    tempObj.lat = 59.91;
    tempObj.lng = 10.75;
    tempObj.enable=['click','touch'];
    /*tempObj.layer="Options";*/
    tempObj.icon= {
                        type: 'div',
                        iconSize: [25, 60],
                        popupAnchor:  [0, -50],
                        iconAnchor:   [10, 45],
                        html: '<img class="map-user-marker" src="assets/images/user-image.jpg">'  
                 }
    tempObj.message='<div class="cn-wrapper opened-nav" id="cn-wrapper"><ul>   <li><a href="#"><img class="calling-icon-map" src="assets/images/map-icons/icon_call.png"></a></li> <li><a href="#"><img src="assets/images/map-icons/icon_contact_rollover.png"></a></li> <li><a href="#"><img src="assets/images/map-icons/icon_favorite.png"></a></li>  <li><a href="#"><img class="add-icon-map" src="assets/images/map-icons/icon_add.png"></a></li>  </ul></div>';
    $scope.markers.push(tempObj)
     var eventNameClick = 'leafletDirectiveMarker.myMap.click';
     var eventNameTouch = 'leafletDirectiveMarker.myMap.touch';
                $scope.$on(eventNameClick, function(event, args){
                    

                 var  wrapper = document.getElementById('cn-wrapper');
                 classie.add(wrapper, 'opened-nav');

                });
                $scope.$on(eventNameTouch, function(event, args){
                    

                 var  wrapper = document.getElementById('cn-wrapper');
                 classie.add(wrapper, 'opened-nav');

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