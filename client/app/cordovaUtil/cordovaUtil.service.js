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
	   		var that=this;
	   		console.log("My cordinates ",position);
		   var mySavedLocationCoordinates = window.localStorage.getItem('SavedLocationCoordinates');
		   var UUID = that.getDeviceUUID();
		   if(mySavedLocationCoordinates != undefined)
		   {
		   	   mySavedLocationCoordinates = JSON.parse(mySavedLocationCoordinates);	
			   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
			   trackedLocationCoordinatesObject.latitude=position.coords.latitude;
			   trackedLocationCoordinatesObject.longitude=position.coords.longitude;	
			   trackedLocationCoordinatesObject.timestamp=position.timestamp;		
			   trackedLocationCoordinatesObject.UUID=UUID;

			   console.log('current location object :',trackedLocationCoordinatesObject);
			   mySavedLocationCoordinates.TrackedLocations.push(trackedLocationCoordinatesObject);

			/* parse.addObjects('coordinatesObj',trackedLocationCoordinatesObject).then(function(res){
			   	alert("done")
			   	console.log(res);
			   },function(err){
			   		console.log(err);
			   });*/

				parse.saveObject('coordinatesObj',trackedLocationCoordinatesObject).then(function(res){
			   //	alert("done")
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
			  
			   
			   trackedLocationCoordinatesObject.latitude=position.coords.latitude;
			   trackedLocationCoordinatesObject.longitude=position.coords.longitude;	
			   trackedLocationCoordinatesObject.timestamp=position.timestamp;
			   trackedLocationCoordinatesObject.UUID=UUID;			   
			   alert('current location object : ' + JSON.stringify(trackedLocationCoordinatesObject));
			   trackedLocationsArray.push(trackedLocationCoordinatesObject);
			   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocationsArray;
			   parse.saveObject('coordinatesObj',trackedLocationCoordinatesObject).then(function(res){
			   //	alert("done")
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
		   /*var deviceDetails = window.localStorage.getItem('DeviceInformation');
		   deviceDetails = JSON.parse(deviceDetails);
		   if(deviceDetails != undefined)	return deviceDetails.uuid;
		   else	return device.uuid;*/
		   return "ThisIsASampleDeviceUUID";
	   },
	   getAllCoordinates:function(){
	   	parse.getObjects().
	   	then(function(res){
	   		
	   		var coordinates = _.map(res,function(d){return d.toJSON()});
	   		return coordinates;
	   	},function(err){
			  console.log(err);
		});
	   }
	   
   }
  }]);
