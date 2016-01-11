'use strict';

angular.module('cbApp')
  .service('staticData', function (httpRequest) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    return{
    	getTCSLocations:function(){
    		return httpRequest.get("./app/tcsLocationsPune.json");
    	}
    }
  });
