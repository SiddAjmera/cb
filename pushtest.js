var gcm = require('node-gcm');
 
var message = new gcm.Message({
    priority: 'high',
    contentAvailable: true,
    timeToLive: 3,
    data: {
        message: 'You have an appointment in 1 hour',
        key2: 'message2'
    },
    notification: {
        title: "Commute buddy",
        icon: "ic_launcher",
        body: "Tea."
    }
});
 
var regIds = 
['cwseZgmg0n8:APA91bGe_gDw-upSJz4cnRfbv0mvZoqOIYN8K-q_EeGfReZ372QNjxqHvXfyZTCl-kAtfORda3dBeHbqJVoiCBvvEC7cXoqaxiE8bKaXg_zNMmGHb3ZtFHPym9_I-gwRbFCYDfLwEAsW'];
 
// Set up the sender with you API key 
var sender = new gcm.Sender('AIzaSyDE69ofSO7JtqSRSK92ivGUo44cpQPfpmg');
 
// Now the sender can be used to send messages 
sender.send(message, { registrationIds: regIds }, function (err, result) {
    if(err) console.error(err);
    else    console.log(result);
});
 
