'use strict';

angular.module('cbApp')
  .service('localStorage', ['$window',function ($window) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    return{
    	isInitialized:function(){
    		return $window.sessionStorage.getItem('init');
    	},
    	initialize:function(){
    		$window.sessionStorage.setItem('init',true);
    	}
    }

  }]);
