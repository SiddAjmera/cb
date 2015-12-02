'use strict';

angular.module('cbApp')
  .service('cordovaUtil',['parse',function (parse) {
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
				   console.log('Error Code: ' + error.code +  ' Error Message: ' + error.message);
				   alert('Error Code: ' + error.code +  ' Error Message: ' + error.message);
			   });
		  
	   },
	   
	   saveCoordinates:function(position)
	   {
	   		console.log("My cordinates ",position);
		   var mySavedLocationCoordinates = window.localStorage.getItem('SavedLocationCoordinates');
		   
		   if(mySavedLocationCoordinates != undefined)
		   {
		   	   mySavedLocationCoordinates = JSON.parse(mySavedLocationCoordinates);	
			   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
			   trackedLocationCoordinatesObject = {};
			   var timestamp = 't'+position.timestamp
			   var latObj={};
			   latObj.Latitude=position.coords.latitude;
			   latObj.Longitude=position.coords.longitude;	
			   latObj.timestamp=position.timestamp;		
			   trackedLocationCoordinatesObject[timestamp] = latObj;

			   console.log('current location object :',trackedLocationCoordinatesObject);
			   mySavedLocationCoordinates.TrackedLocations.push(trackedLocationCoordinatesObject);

			 parse.addObjects('coordinatesObj',trackedLocationCoordinatesObject).then(function(res){
			   	alert("done")
			   	console.log(res);
			   },function(err){
			   		console.log(err);
			   });
			   window.localStorage.setItem('SavedLocationCoordinates',JSON.stringify(mySavedLocationCoordinates));
		   }
		   else
		   {
			   var objectToStoreTheTrackedLocationsArray = {};	// Object to store the TrackedLocations Array
			   var trackedLocationsArray = [];	// Attribute in the ObjectToStoreTheTrackedLocationsArray to store array of Tracked Locations			   
			   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
			   var timestamp = 't'+position.timestamp;
			   var latObj={};
			   latObj.Latitude=position.coords.latitude;
			   latObj.Longitude=position.coords.longitude;	
			   latObj.timestamp=position.timestamp;			   
			   trackedLocationCoordinatesObject[timestamp] =latObj;


			   
			  // trackedLocationCoordinatesObject.TimeStamp = position.timestamp;
			 /*  trackedLocationCoordinatesObject.TimeStamp.Latitude = position.coords.latitude;
			   trackedLocationCoordinatesObject.TimeStamp.Longitude = position.coords.longitude;*/
			   alert('current location object : ' + JSON.stringify(trackedLocationCoordinatesObject));
			   trackedLocationsArray.push(trackedLocationCoordinatesObject);
			   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocationsArray;
			   parse.saveObject('coordinatesObj',trackedLocationCoordinatesObject).then(function(res){
			   	alert("done")
			   	console.log(res);
	
			   },function(err){
			   		console.log(err);
			   });
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
  }]);
