'use strict';

angular.module('cbApp')
  .service('pushnotification', function ($cordovaPush,$q,$rootScope) {
    return {
      registerPushNotification:function(){
        
        var androidConfig = {
              "senderID": "463291795017",
            };
              $cordovaPush.register(androidConfig).then(function(result) {
         console.log(result)
    }, function(err) {
      console.log(err)
    })
    
      }
    }
  });
