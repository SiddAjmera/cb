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

// This was to sent Push Notification to Every User Except the One Who is Posting the Ride.
// We will not be Using this anymore, as we will not be sending Notification When a Ride is Posted.
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

// This is to Notify the Person who posted a Ride(HOST) about a request by someone who is interested in sharing a ride with the HOST
exports.notifyHostAboutANewRiderRequest = function(ride){
    var redgIds = [];
    redgIds.push(ride.offeredBy.redgId);
    message.params.data.message = ride.riders[(ride.riders.length - 1)].empName + ' has requested to Ride with you from ' + ride.startLocation.display_address + ' to ' + ride.endLocation.display_address;
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// This is to Notify the Rider who requested a ride about the Host's Response
exports.notifyRiderAboutHostResponse = function(ride, riderRedgId, riderStatus){
    var redgIds = [];
    redgIds.push(riderRedgId);
    message.params.data.message = ride.offeredBy.empName + ' has ' + riderStatus + ' your Ride Request';
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies the riders that the host has cancelled the ride
exports.notifyAboutCancelledRide = function(ride){
    var redgIds = [];
    redgIds = ride.riders.map(function(rider){ return rider.redgId; });
    message.params.data.message = ride.offeredBy.empName + ' has cancelled the ride. Please find another ride.';
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies the riders that the host has rescheduled the ride
exports.notifyAboutRescheduledRide = function(ride){
    var redgIds = [];
    redgIds = ride.riders.map(function(rider){ return rider.redgId; });
    message.params.data.message = ride.offeredBy.empName + ' has rescheduled the ride. The ride will now start at ' + ride.rideScheduledTime;
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies Team Members that they have been requested to be added to the Creator's Team
exports.teamCreatedNotification = function(team){
    var redgIds = team.members.map(function(member){ return member.redgId; });
    message.params.data.message = team.createdBy.empName + ' has requested you to add to his team';
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies Newly Added Team Members about Team Creator's Request to Add them as a team member to an Existing Team
exports.notifyRecentlyAddedTeamMembers = function(team, newlyAddedMembersRedgIds){
    message.params.data.message = team.createdBy.empName + ' has added you as a team member.';
    sender.send(message, { registrationIds: newlyAddedMembersRedgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies the host about a potential members response to the Team Creator's Request
exports.notifyTeamCreatorAboutMemberResponse = function(team, memberName, memberResponse){
    var redgIds = [];
    redgIds.push(team.offeredBy.redgId);
    message.params.data.message = memberName + ' has ' + memberResponse + ' your offer to become a Team Members';
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};