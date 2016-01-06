//var google = require('google-maps');

exports.getMajorWayPoints = function(source, destination){
/*	console.log('Google Object : ' + JSON.stringify(google));
	var start = new google.maps.LatLng(source.latitude, source.longitude);
	var end = new google.maps.LatLng(destination.latitude, destination.longitude);
	var request = {
	  origin:start,
	  destination:end,
	  travelMode: google.maps.TravelMode.DRIVING
	};

	var pointsArray = [];

	DirectionsService.route(request, function(result, status) {

		console.log('Status : ' + status);

	    for (var route in result.routes) {
	        for (var leg in route.legs) {
	            for (var step in leg.steps) {
	                for (var latlng in step.path) {
	                    pointsArray.push(latlng)
	                }
	            }
	        }
	    }
	});


	if(pointsArray.length > 0){
		console.log('The Points Array was Successfully Received. He it is : ' + JSON.stringify(pointsArray));
		return pointsArray;
	}*/



	/*function initMap() {
		  var directionsService = new google.maps.DirectionsService;
		  var directionsDisplay = new google.maps.DirectionsRenderer;
		  var map = new google.maps.Map(document.getElementById('map'), {
		    zoom: 7,
		    center: {lat: 41.85, lng: -87.65}
		  });
		  directionsDisplay.setMap(map);

		  var onChangeHandler = function() {
		    calculateAndDisplayRoute(directionsService, directionsDisplay);
		  };
		  document.getElementById('start').addEventListener('change', onChangeHandler);
		  document.getElementById('end').addEventListener('change', onChangeHandler);
	}

	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;

	var start = new google.maps.LatLng(source.latitude, source.longitude);
	var end = new google.maps.LatLng(destination.latitude, destination.longitude);

	directionsService.route({
		    origin: start,
		    destination: end,
		    travelMode: google.maps.TravelMode.DRIVING
		  }, function(response, status) {
		    if (status === google.maps.DirectionsStatus.OK) {
		      directionsDisplay.setDirections(response);
		    } else {
		      window.alert('Directions request failed due to ' + status);
		    }
		  });*/



};