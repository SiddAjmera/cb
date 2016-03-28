exports.createActivity = function (activityString){
	var activity = {};
	activity.activityTime = new Date().getTime();
	activity.activity = activityString;
	return activity;
}