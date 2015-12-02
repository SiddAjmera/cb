'use strict';

angular.module('cbApp')
  .service('cordovaUtil', function (cordovaInit) {
   return {
	   getCoordinates:function()
	   {
		   var that=this;
		  
			   navigator.geolocation.watchPosition(function(position)
			   {
				   // The onSuccess method for  Geolocation
				   var myLatLag = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);	//Create a Google MAP
				   var myoptions = { zoom: 14, center: myLatLag, mapTypeId: google.maps.MapTypeId.ROADMAP};	//Set option for map so that is use latlng center
				   var map = new google.maps.Map(document.getElementById("mapCanvas"), myoptions);	//google map instance
				   var marker = new google.maps.Marker({ position: myLatLag, map: map });	//add marker for our location
				   that.saveCoordinates(position);
			   }, function(error)
			   {
				   // The  Callback use to  receive a PositionError object
				   alert('Error Code: ' + error.code +  ' Error Message: ' + error.message);
			   });
		  
	   },
	   
	   saveCoordinates:function(position)
	   {
		   var mySavedLocationCoordinates = window.localStorage.getItem('SavedLocationCoordinates');
		   mySavedLocationCoordinates = JSON.parse(mySavedLocationCoordinates);
		   if(mySavedLocationCoordinates != undefined)
		   {
			   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
			   trackedLocationCoordinatesObject.Latitude = position.coords.latitude;
			   trackedLocationCoordinatesObject.Longitude = position.coords.longitude;
			   mySavedLocationCoordinates.push(trackedLocationCoordinatesObject);
			   window.localStorage.setItem('SavedLocationCoordinates',JSON.stringify(mySavedLocationCoordinates));
		   }
		   else
		   {
			   var objectToStoreTheTrackedLocationsArray = {};	// Object to store the TrackedLocations Array
			   var trackedLocationsArray = [];	// Attribute in the ObjectToStoreTheTrackedLocationsArray to store array of Tracked Locations			   
			   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
			   trackedLocationCoordinatesObject.Latitude = position.coords.latitude;
			   trackedLocationCoordinatesObject.Longitude = position.coords.longitude;
			   trackedLocationsArray.push(trackedLocationCoordinatesObject);
			   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocationsArray;
			   window.localStorage.setItem('SavedLocationCoordinates',JSON.stringify(objectToStoreTheTrackedLocationsArray));
		   }
	   },
	   
	   saveDeviceDetails:function()
	   {
		   localStorage.setItem('DeviceInformation', JSON.stringify(device));
	   },
	   
	   getDeviceUUID:function()
	   {
		   var deviceDetails = window.localStorage.getItem('DeviceInformation');
		   deviceDetails = JSON.parse(deviceDetails);
		   if(deviceDetails != undefined)	return deviceDetails.uuid;
		   else	return device.uuid;
	   }
	   
   }
  });
