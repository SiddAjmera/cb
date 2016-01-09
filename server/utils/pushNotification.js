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
     var userId = ride.offeredByUserId;
     User.regIdsForOtherUsers(userId).then(function(redgIds){
        //console.log('\nGot redgIds as : ' + JSON.stringify(redgIds));
        User.nameByUserId(userId).then(function(empName){
            //console.log('\nGot empName as : ' + JSON.stringify(empName));
            //console.log('\nThe Message Object : ' + JSON.stringify(message));
            message.params.data.message = "A new ride has been posted by " + empName + " from " + ride.startLocation + " to " + ride.endLocation;
            //console.log('\nThis is the Notification Message : ' + JSON.stringify(message.params.data.message));
            sender.send(message, { registrationIds: redgIds }, function (err, result) {
                if(err) console.error(err);
                else    console.log(result);
            });
        });

     });
};