exports.geoJSONify = function(locations){
	var geoJSONLocations = [];
	for(var i = 0; i < locations.length; i++){
		geoJSONLocations.push([locations[i].location.latitude, locations[i].location.longitude]);
	}
	if(geoJSONLocations.length > 0) return geoJSONLocations;
};