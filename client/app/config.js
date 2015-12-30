if(angular.isUndefined(config)){
	var config={};
	config.apis={};
}


//base URL for API
//config.apiBaseURL="http://172.29.181.56:9000/";
config.apiBaseURL="http://localhost:9000/";

/*apis start from here*/

config.apis.login = "auth/local";
config.apis.syncLocations = "api/locations";
