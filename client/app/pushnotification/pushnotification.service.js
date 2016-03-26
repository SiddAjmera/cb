//Data Body
/*
additionalData: {
  collapse_key: "com.tcs.cb"
  e: "1"
  foreground: true
  icon: "ic_launcher"
  key2: "message2"
},
message: "You have an appointment in 1 hour"
title: "Commute buddy"
*/

'use strict';

angular.module('cbApp')
  .service('pushnotification', function ($q) {
    return {
      registerPushNotification : function(){
        var deferred= $q.defer();

        var androidConfig = {
             "senderID": "463291795017",
             "sound": "true",
             "icon":"logo",
             "iconColor":"blue",
             "vibrate": "true",
             "clearNotifications": "true"

            };

        var push = PushNotification.init({
          android: androidConfig,
          ios: {
            alert: "true",
            badge: true,
            sound: 'false'
          },
          windows: {}
        });

        push.on('registration', function(data) {
          console.log("Registration Event Callback");
          console.log("data.registrationId: ", data.registrationId);
          deferred.resolve(data.registrationId);
        });

        push.on('notification', function(data) {
            console.log("Notification Event Callback");
            console.log("Data from Notification Event Callback : ", JSON.stringify(data));
            push.finish(function() {
              alert('finish successfully called');
            });
            push.approve(function() {
                alert("Approve Got Called Successfully");
            });
            push.reject(function() {
                alert("Reject Got Called Successfully");
            });
        });

        push.on('error', function(e) {
          console.log("Error Event Callback");
          console.log("Error : ", e);
          alert("push error");
        });

        return deferred.promise;
      }

      /*window.approve = function(data){
        alert("Approve Triggered");
        console.log("Approve Callback Triggred. Here is the Data : ", data);
      }

      window.reject = function(data){
        alert("Reject Triggred");
        console.log("Reject Callback Triggred. Here is the Data : ", data);
      }*/
    }
});