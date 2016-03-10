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
var apiKey = "AIzaSyDE69ofSO7JtqSRSK92ivGUo44cpQPfpmg";
var sender = new gcm.Sender(apiKey);
var message = new gcm.Message();
var regIds = [];
message.addData('title', 'COMMUTE BUDDY');

/*var messageText="This is a sample message";
var message = new gcm.Message({
    priority: 'high',
    contentAvailable: true,
    timeToLive: 3,
    data: {
        message: messageText,
        key2: 'message2',
        actions: [
            { "icon": "emailGuests", "title": "ACCEPT", "callback": "app.emailGuests"},
            { "icon": "snooze", "title": "REJECT", "callback": "app.snooze"}
        ]
    },
    notification: {
        title: "COMMUTE BUDDY",
        icon: "ic_launcher",
        icon: "logo",
        color: "#329D71",
        sound: "notification_sound",
        body: "This is a notification that will be displayed ASAP."
    }
});*/
 

 
// Set up the sender with you API key 
//var sender = new gcm.Sender('AIzaSyDE69ofSO7JtqSRSK92ivGUo44cpQPfpmg');
 
// Now the sender can be used to send messages 
/*sender.send(message, { registrationIds: regIds }, function (err, result) {
    if(err) console.error(err);
    else    console.log(result);
});*/

// This was to sent Push Notification to Every User Except the One Who is Posting the Ride.
// We will not be Using this anymore, as we will not be sending Notification When a Ride is Posted.
exports.newRideNotification = function(ride){
     var empId = ride.offeredBy.empId;
     User.regIdsForOtherUsers(empId).then(function(redgIds){
        //message.params.data.message = "A new ride has been posted by " + ride.offeredBy.empName + " from " + ride.startLocation.display_address + " to " + ride.endLocation.display_address;
        //message.params.data.message = "A new ride has been posted by " + ride.offeredBy.empName + " from " + ride.startLocation.display_address + " to " + ride.endLocation.display_address;
        //message.params.notification.body = "A new ride has been posted by " + ride.offeredBy.empName + " from " + ride.startLocation.display_address + " to " + ride.endLocation.display_address;
        //console.log("A new Ride Notification to all the Users : " + message.params.data.message);
        
        var notificationMessage = "A new ride has been posted by " + ride.offeredBy.empName + " from " + ride.startLocation.display_address + " to " + ride.endLocation.display_address;

        
        /*message.addData('message', 'Scrum: Daily touchbase @ 10am Please be on time so we can cover everything on the agenda.');*/
        message.addData('message', notificationMessage);
        message.addData('actions', [
            { "icon": "emailGuests", "title": "EMAIL GUESTS", "callback": "app.emailGuests"},
            { "icon": "snooze", "title": "SNOOZE", "callback": "app.snooze"},
        ]);

        sender.send(message, { registrationIds: redgIds }, function (err, result) {
            console.log("Message Body : " + JSON.stringify(message));
            if(err) console.error(err);
            else    console.log(result);
        });
     });
};

// This is to Notify the Person who posted a Ride(HOST) about a request by someone who is interested in sharing a ride with the HOST
exports.notifyHostAboutANewRiderRequest = function(ride){
    var redgIds = [];
    redgIds.push(ride.offeredBy.redgId);
    var notificationMessage = ride.riders[(ride.riders.length - 1)].empName + ' has requested to Ride with you from ' + ride.startLocation.display_address + ' to ' + ride.endLocation.display_address;
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "APPROVE", "callback": "window.approve"},
        { "icon": "snooze", "title": "REJECT", "callback": "window.reject"},
    ]);
    
    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// This is to Notify the Rider who requested a ride about the Host's Response
exports.notifyRiderAboutHostResponse = function(ride, riderRedgId, riderStatus){
    var redgIds = [];
    redgIds.push(riderRedgId);
    var notificationMessage = ride.offeredBy.empName + ' has ' + riderStatus + ' your Ride Request';
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "VIEW RIDE", "callback": "app.emailGuests"},
        { "icon": "snooze", "title": "CANCEL RIDE", "callback": "app.snooze"},
    ]);

    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies the riders that the host has cancelled the ride
exports.notifyAboutCancelledRide = function(ride){
    var redgIds = [];
    redgIds = ride.riders.map(function(rider){ return rider.redgId; });
    var notificationMessage = ride.offeredBy.empName + ' has cancelled the ride. Please find another ride.';
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "FIND RIDE", "callback": "app.emailGuests"},
    ]);

    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

exports.notifyHostAboutRiderCancellation = function(ride){
    var redgIds = [];
    redgIds.push(ride.offeredBy.redgId);
    var notificationMessage = ride.riderWhoCancelled.empName + ' has cancelled the ride. Another seat is vacant now.';
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "VIEW RIDE", "callback": "app.emailGuests"},
    ]);

    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
}

// Notifies the riders that the host has rescheduled the ride
exports.notifyAboutRescheduledRide = function(ride){
    var redgIds = [];
    redgIds = ride.riders.map(function(rider){ return rider.redgId; });
    var notificationMessage = ride.offeredBy.empName + ' has rescheduled the ride. The ride will now start at ' + ride.rideScheduledTime;
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "VIEW RIDE", "callback": "app.emailGuests"},
        { "icon": "emailGuests", "title": "CANCEL RIDE", "callback": "app.emailGuests"},
    ]);

    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies Team Members that they have been requested to be added to the Creator's Team
exports.teamCreatedNotification = function(team){
    var redgIds = team.members.map(function(member){ return member.redgId; });
    var notificationMessage = team.createdBy.empName + ' has requested you to add to his team';
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "APPROVE", "callback": "app.emailGuests"},
        { "icon": "emailGuests", "title": "REJECT", "callback": "app.emailGuests"},
    ]);

    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies Newly Added Team Members about Team Creator's Request to Add them as a team member to an Existing Team
exports.notifyRecentlyAddedTeamMembers = function(team, newlyAddedMembersRedgIds){
    var notificationMessage = team.createdBy.empName + ' has added you as a team member.';
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "APPROVE", "callback": "app.emailGuests"},
        { "icon": "emailGuests", "title": "REJECT", "callback": "app.emailGuests"},
    ]);

    sender.send(message, { registrationIds: newlyAddedMembersRedgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};

// Notifies the host about a potential members response to the Team Creator's Request
exports.notifyTeamCreatorAboutMemberResponse = function(team, memberName, memberResponse){
    var redgIds = [];
    redgIds.push(team.createdBy.redgId);
    var notificationMessage = memberName + ' has ' + memberResponse + ' your offer to become a Team Members';
    message.addData('message', notificationMessage);
    message.addData('actions', [
        { "icon": "emailGuests", "title": "VIEW TEAM", "callback": "app.emailGuests"},
        { "icon": "emailGuests", "title": "ADD MEMBERS", "callback": "app.emailGuests"},
    ]);

    sender.send(message, { registrationIds: redgIds }, function (err, result) {
        if(err) console.error(err);
        else    console.log(result);
    });
};