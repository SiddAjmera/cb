if(angular.isUndefined(config)){
	var config = {};
	config.apis = {};
}


//base URL for API

config.apiBaseURL="http://localhost:9000/";
//config.apiBaseURL="http://52.77.218.140:9000/";
//config.apiBaseURL="http://192.168.44.66:9000/"


/*apis start from here*/

config.apis.login = "auth/local";
config.apis.syncLocations = "api/locations";
config.apis.getAllUsers = "api/users/";
config.apis.signup = "api/users/";
/*for filtering*/
config.apis.filterLocations = "api/locations/FilterLocation";
config.apis.getStats = "api/drives/FilterDrive";
config.apis.getDrives = "api/drives/LatestDriveId";


/*ride apis*/
config.apis.postRide = "api/rides/";
config.apis.filterRides = "api/rides/GetAvailableRides";
config.apis.selectRide = "api/rides/AddCompanionToRide/";
config.apis.latestActiveRideOfUser = "api/rides/GetLatestActiveRide";
config.apis.cancelRide = "api/rides/CancelRide/";
config.apis.rescheduleRide = "api/rides/RescheduleRide/";
config.apis.deleteRide = "api/rides/";

/*team apis*/
config.apis.createTeam = "api/teams/";
config.apis.getUserTeams = "api/teams/TeamsOfUser";
config.apis.getTeamDetails = "api/teams/";

config.cordova=false;

//"cwseZgmg0n8:APA91bGe_gDw-upSJz4cnRfbv0mvZoqOIYN8K-q_EeGfReZ372QNjxqHvXfyZTCl-kAtfORda3dBeHbqJVoiCBvvEC7cXoqaxiE8bKaXg_zNMmGHb3ZtFHPym9_I-gwRbFCYDfLwEAsW"

