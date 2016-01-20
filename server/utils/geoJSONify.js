exports.geoJSONify = function(locations){
	var geoJSONLocations = [];
	for(var i = 0; i < locations.length; i++){
		geoJSONLocations.push([locations[i].location.latitude, locations[i].location.longitude]);
	}
	if(geoJSONLocations.length > 0) return geoJSONLocations;
};

exports.toArrayOfUserIds = function(companions){
	var arrayOfUserIds = [];
	for(var i = 0; i < companions.length; i++){
		arrayOfUserIds.push(companions[i].userId);
	}
	if(arrayOfUserIds.length > 0) return arrayOfUserIds;
};