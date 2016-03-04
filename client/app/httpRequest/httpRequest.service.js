'use strict';

angular.module('cbApp')
  .factory('httpRequest',['$http',function($http) {
    // Service logic
    // ...
    return{
       get: function(url,params)
       {
          var promise;
          var req = {};   
          if(params){
            var qs = queryString.stringify(params);
            req.url = config.apiBaseURL + url + "?" + qs;
          }
          else{
              req.url = config.apiBaseURL + url;
          }
            
          //req.url = config.apiBaseURL+url+"?"+qs; //BaseURl+API+?+queryString
          req.method = 'GET';
          promise = $http(req).
                  then(function (response) {
                    return response ;
                  });

          // Return the promise to the controller
          return promise;
       },

      post: function(url,data)
      {
          var promise;
          var req = {};
          req.data=data;
          req.url = config.apiBaseURL+url;
          req.method = 'POST';
          promise = $http(req).
                   then(function (response) {
                    return response ;
                  });
          // Return the promise to the controller
          return promise;
      },
      put:function(url,data){
         var promise;
          var req = {};
          req.data = data;
          req.url = config.apiBaseURL + url;
          req.method = 'PUT';
          promise = $http(req).
                  then(function (response) {
                    return response ;
                  });
          // Return the promise to the controller
          return promise;
      }
    }
   }
  ]);