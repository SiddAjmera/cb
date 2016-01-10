'use strict';

angular.module('cbApp')
  .service('pushnotification', function ($q) {
    return {
      registerPushNotification:function(){
        var deferred= $q.defer();
        var androidConfig = {
              "senderID": "463291795017",
             "icon":"logo",
             "iconColor":"blue"
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
          console.log(data.registrationId);
          deferred.resolve(data.registrationId)
      });
    return deferred.promise;
      }
    }
  });
