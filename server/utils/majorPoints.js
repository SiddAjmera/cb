exports.getMajorWayPoints = function(source, destination){
	var start = new google.maps.LatLng(source[0],source[1]);
	var end = new google.maps.LatLng(destination[0],destination[1]);
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
	}
	
};