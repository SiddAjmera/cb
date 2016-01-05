var Turf = require('turf');

var driveString = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "LineString"/*,
    "coordinates": [
      [-77.031669, 38.878605],
      [-77.029609, 38.881946],
      [-77.020339, 38.884084],
      [-77.025661, 38.885821],
      [-77.021884, 38.889563],
      [-77.019824, 38.892368]
    ]*/
  }
};

exports.calculateTotalDistance = function(locationsArray){
	driveString.geometry.coordinates = locationsArray;

	// units	String	can be degrees, radians, miles, or kilometers
	var length = Turf.lineDistance(driveString, 'kilometers');
	console.log('The length of the Drive String is : ' + length + 'kilometers');
};