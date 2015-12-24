'use strict';

angular.module('cbApp')
  .service('localStorage', ['$window','$localForage',function ($window,$localForage) {
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
