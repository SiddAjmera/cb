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
        body: "This is a notification that will be displayed ASAP."
    }
});
 
var regIds = 
['fS0jCl-59-o:APA91bEmsQYhAjXuVQiJ1QoDnSS7jg04i_s9kY69JN6vqbmmDCTxNASyJMLtrnE8I1GFheQext_QKjAmjBU8aAOHoQtm2uNse5gaJA8padwGGahadhFHEA3WIHWTB6PApi5vUob7i0gg'];
 
// Set up the sender with you API key 
var sender = new gcm.Sender('AIzaSyDE69ofSO7JtqSRSK92ivGUo44cpQPfpmg');
 
// Now the sender can be used to send messages 
sender.send(message, { registrationIds: regIds }, function (err, result) {
    if(err) console.error(err);
    else    console.log(result);
});
 
