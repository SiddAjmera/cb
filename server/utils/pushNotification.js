/*{
    "params": {
        "priority":"high",
        "contentAvailable":true,
        "timeToLive":3,
        "data": {
            "message":"This is a sample message",
            "key2":"message2"
        },
        "notification":{
            "title":"Commute buddy",
            "icon":"ic_launcher",
            "body":"This is a notification that will be displayed ASAP."
        }
    }
}*/

var gcm = require('node-gcm');
var User = require('../api/user/user.controller');

var messageText="This is a sample message";
var message = new gcm.Message({
    priority: 'high',
    contentAvailable: true,
    timeToLive: 3,
    data: {
        message: messageText,
        key2: 'message2'
    },
    notification: {
        title: "Commute buddy",
        icon: "ic_launcher"
        // body: "This is a notification that will be displayed ASAP."
    }
});
 
var regIds = [];
 
// Set up the sender with you API key 
var sender = new gcm.Sender('AIzaSyDE69ofSO7JtqSRSK92ivGUo44cpQPfpmg');
 
// Now the sender can be used to send messages 
sender.send(message, { registrationIds: regIds }, function (err, result) {
    if(err) console.error(err);
    else    console.log(result);
});

exports.newRideNotification = function(ride){
     var empId = ride.offeredBy.empId;
     User.regIdsForOtherUsers(empId).then(function(redgIds){
        message.params.data.message = "A new ride has been posted by " + ride.offeredBy.empName + " from " + ride.startLocation.display_address + " to " + ride.endLocation.display_address;
        sender.send(message, { registrationIds: redgIds }, function (err, result) {
            if(err) console.error(err);
            else    console.log(result);
        });
     });
};

exports.notifyHostAboutANewRiderRequest = function(ride){
    var hostEmpId = ride.offeredBy.empId;
    User.redgIdByEmpId(empId).then(function(redgId){
        var redgIds = [];
        redgIds.push(redgId);
        message.params.data.message = ride.riders[(ride.riders.length - 1)].empName + ' has requested to Ride with you from ' + ride.startLocation.display_address + ' to ' + ride.endLocation.display_address;
        sender.send(message, { registrationIds: redgIds }, function (err, result) {
            if(err) console.error(err);
            else    console.log(result);
        });
    });
};

exports.notifyRiderAboutHostResponse = function(ride, riderEmpId){
    message.params.data.message = null;
    User.redgIdByEmpId(riderEmpId).then(function(redgId){
        var redgIds = [];
        redgIds.push(redgId);

        // Determine if the Rider is in the Riders Array AND with CONFIRMED status
        ride.riders.forEach(function(rider){
            if(rider.empId == riderEmpId && rider.riderStatus == "CONFIRMED") message.params.data.message = ride.offeredBy.empName + ' has accepted your ride request.';
        });
        if(!message.params.data.message) message.params.data.message = ride.offeredBy.empName + ' has rejected your ride request.';
        sender.send(message, { registrationIds: redgIds }, function (err, result) {
            if(err) console.error(err);
            else    console.log(result);
        });
    });
};