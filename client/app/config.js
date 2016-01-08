if(angular.isUndefined(config)){
	var config={};
	config.apis={};
}


//base URL for API

//config.apiBaseURL="http://localhost:9000/";
config.apiBaseURL="http://52.77.218.140:9000/";
//config.apiBaseURL="http://192.168.1.100:9000/"


/*apis start from here*/

config.apis.login = "auth/local";
config.apis.syncLocations = "api/locations";
config.apis.getAllUsers = "api/users/";
config.apis.signup = "api/users/";
/*for filtering*/
config.apis.filterLocations = "api/locations/FilterLocation";
config.apis.getStats = "api/drives/FilterDrive";
config.apis.getDrives = "api/drives/LatestDriveId";
config.apis.postRide = "api/rides/"

config.cordova=true;

