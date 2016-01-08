var gcm = require('node-gcm');
 var messageText="this is a sample message";
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
        icon: "ic_launcher",
        body: "This is a notification that will be displayed ASAP."
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
 
