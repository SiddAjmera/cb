'use strict';

angular.module('cbApp')
  .service('cordovaInit', function($document, $q, $interval) {
return {
	deviceready:function(){
		 var d = $q.defer(),
	        resolved = false;

	    var self = this;
	    this.ready = d.promise;

	    document.addEventListener('deviceready', function() {
	      resolved = true;
	      d.resolve(window.cordova);
	    });

	    // Check to make sure we didn't miss the 
	    // event (just in case)
	    setTimeout(function() {
	      if (!resolved) {
	        if (window.cordova) d.resolve(window.cordova);
	      }
	    }, 3000);
	},
	 loadGoogleMap:function(){
		 var googleMapLoaded=false;
		 
		 var interval= $interval(function() {
	      if (!googleMapLoaded) {
	        $.getScript('http://maps.google.com/maps/api/js?sensor=false&libraries=places', function( data, textStatus, jqxhr){
				if(textStatus==200){
					googleMapLoaded=true;
					$interval.cancel(interval)
				}
				
			})
	      }
	    }, 3000);
		 
	 }
	
}
	   
	});
