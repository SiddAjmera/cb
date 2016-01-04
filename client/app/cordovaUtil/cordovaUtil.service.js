'use strict';

angular.module('cbApp')
  .service('cordovaUtil',['parse','User','httpRequest','localStorage','$q','$rootScope',function (parse,user,httpRequest,localStorage,$q,$rootScope) {
  var currentUser = {};
  var watchId;
   user.get().$promise.
   then(function(user){
   	currentUser = user;
   	console.log("currentUser",currentUser)
   });


   return {
	   getCoordinates:function()
	   {
		   var that=this;
		  
			   watchId = navigator.geolocation.watchPosition(function(position)
			   {
				   // The onSuccess method for  Geolocation
				   // var myLatLag = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);	//Create a Google MAP
				   // var myoptions = { zoom: 14, center: myLatLag, mapTypeId: google.maps.MapTypeId.ROADMAP};	//Set option for map so that is use latlng center
				   // var map = new google.maps.Map(document.getElementById("mapCanvas"), myoptions);	//google map instance
				   // var marker = new google.maps.Marker({ position: myLatLag, map: map });	//add marker for our location
				   that.saveCoordinates(position);
				   $rootScope.$broadcast("locationCaptured");
			   }, function(error)
			   {
				   // The  Callback use to  receive a PositionError object
				   console.log('Error Code: ' + error.code +  ' Error Message: ' + error.message);
				   alert('Error Code: ' + error.code +  ' Error Message: ' + error.message);
			   },{
				   enableHighAccuracy: true,
				   timeout: 10000,
				   frequency:5000
			   });
		  
	   },
	   
	   saveCoordinates:function(position)
	   {	
	   	   var that=this;
	   	   
	   	   console.log("My cordinates ",position);
		  
		   localStorage.retrieve('SavedLocationCoordinates').
		   then(function(item){
		   		   var mySavedLocationCoordinates = item;
		   		   var UUID = that.getDeviceUUID();
				   if(mySavedLocationCoordinates != null)
				   {
				   	   mySavedLocationCoordinates = JSON.parse(mySavedLocationCoordinates);	
					   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
					   trackedLocationCoordinatesObject.location = {};
					   trackedLocationCoordinatesObject.location.latitude=position.coords.latitude;
					   trackedLocationCoordinatesObject.location.longitude=position.coords.longitude;	
					   trackedLocationCoordinatesObject.timestamp=position.timestamp;		
					   trackedLocationCoordinatesObject.uuid=UUID;
					   trackedLocationCoordinatesObject.userId = currentUser.userId;
					   console.log('current location object :',trackedLocationCoordinatesObject);
					   mySavedLocationCoordinates.TrackedLocations.push(trackedLocationCoordinatesObject);
					  // window.localStorage.setItem('SavedLocationCoordinates',JSON.stringify(mySavedLocationCoordinates));
					   localStorage.store('SavedLocationCoordinates',JSON.stringify(mySavedLocationCoordinates));
					
					   console.log('This is the trackedLocationCoordinatesObject : ' + JSON.stringify(trackedLocationCoordinatesObject));
				   }
				   else
				   {
					   var objectToStoreTheTrackedLocationsArray = {};	// Object to store the TrackedLocations Array
					   var trackedLocationsArray = [];	// Attribute in the ObjectToStoreTheTrackedLocationsArray to store array of Tracked Locations			   
					   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
					  
					   trackedLocationCoordinatesObject.location = {};
					   trackedLocationCoordinatesObject.location.latitude=position.coords.latitude;
					   trackedLocationCoordinatesObject.location.longitude=position.coords.longitude;	
					   trackedLocationCoordinatesObject.timestamp=position.timestamp;
					   trackedLocationCoordinatesObject.userId = currentUser.userId;
					   trackedLocationCoordinatesObject.uuid=UUID;			   
					   alert('current location object : ' + JSON.stringify(trackedLocationCoordinatesObject));
					   trackedLocationsArray.push(trackedLocationCoordinatesObject);
					   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocationsArray;
					   localStorage.store('SavedLocationCoordinates',JSON.stringify(objectToStoreTheTrackedLocationsArray)).
					   then(function(val){
					   	   var locationsObjectForMongoDB = window.localStorage.getItem('SavedLocationCoordinates');
						   alert('This is the Current Location Object when localStorageObject is null: ' + val);
						   locationsObjectForMongoDB = JSON.parse(locationsObjectForMongoDB);

						   console.log('This is the trackedLocationCoordinatesObject : ' + JSON.stringify(trackedLocationCoordinatesObject));
						   console.log('This is the trackedLocationsArray : ' + JSON.stringify(trackedLocationsArray));

					   });
				 }
			 });
	
	   },

	   stopSampling: function(){
	   		navigator.geolocation.clearWatch(watchId);
	   		;
	   },

	   saveDeviceDetails:function()
	   {
		   localStorage.store('Device', JSON.stringify(device)).then(function(device){
				return device;
			});
	   },

	   getDeviceUUID:function()
	   {
	   	   	localStorage.retrieve('DeviceUUID').then(function(uuid){
	   			if(uuid != null) return uuid;
	   		});

	   	   	localStorage.store('DeviceUUID', JSON.stringify(device.uuid)).then(function(uuid){
				return uuid;
			});

		   // var deviceDetails = window.localStorage.getItem('DeviceInformation');
		   // deviceDetails = JSON.parse(deviceDetails);
		   // if(deviceDetails != undefined)	return deviceDetails.uuid;
		   // else	return device.uuid;
		   // return "ThisIsASampleDeviceUUID";
	   },

	   getAllCoordinates:function(){
	   	parse.getObjects().
	   	then(function(res){
	   		
	   		var coordinates = _.map(res,function(d){return d.toJSON()});
	   		return coordinates;
	   	},function(err){
			  console.log(err);
		});
	   },

	   syncCoordinates:function(){
	   		 localStorage.retrieve('SavedLocationCoordinates').then(function(locations){
	   			var storedlocations = locations;
	   			if(storedlocations==null) return;
	   			storedlocations = JSON.parse(storedlocations);
	   			httpRequest.post(config.apis.syncLocations,storedlocations.TrackedLocations).
		   		then(function(res){
		   			if(res.status==201){
		   				localStorage.remove('SavedLocationCoordinates');
		   				alert('Data Synced Successfully');
		   			}
		   		});
	   		});		 
	   },

	   syncABatch: function(aBatch){
	   		httpRequest.post(config.apis.syncLocations, aBatch).
		   		then(function(res){
		   			if(res.status==201){
		   				localStorage.remove('SavedLocationCoordinates');
		   				alert('Data Synced Successfully');
		   		}
		   	});
	   },

	    batchSync:function(){
	    		var that=this;
	   			localStorage.retrieve('SavedLocationCoordinates').then(function(locations){
	   			var storedlocations = locations;
	   			if(storedlocations == null) return;
	   			storedlocations = JSON.parse(storedlocations);
	   			var trackedLocations = storedlocations.TrackedLocations;
	   			var almostFinished = false;
	   			while(trackedLocations.length > 0){
	   				if(trackedLocations.length <= 100){
	   					almostFinished = true;
	   					break;
	   				}
	   				else{
	   					httpRequest.post(config.apis.syncLocations,trackedLocations.splice(0, 100)).
				   		then(function(res){
				   			if(res.status == 201){
				   			   var objectToStoreTheTrackedLocationsArray = {};	// Object to store the TrackedLocations Array
							   objectToStoreTheTrackedLocationsArray.TrackedLocations = [];
							   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocations;
							   localStorage.store('SavedLocationCoordinates',JSON.stringify(objectToStoreTheTrackedLocationsArray)).
							   then(function(val){
							   	   that.batchSync();
							   });
				   			}
				   		});
	   				}
	   			}
	   			if(almostFinished) that.syncABatch(trackedLocations);
	   		});
	    },

	   getUserHomeCoordinates: function(){
		   var deferred =$q.defer();
	   		if(!navigator.geolocation) return;
			
			navigator.geolocation.getCurrentPosition(function(pos) {
				
				var geocoder = new google.maps.Geocoder();
				var latlng = {lat: pos.coords.latitude, lng: pos.coords.longitude};
				// var latlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
				// var latlngStr = latlng.split(',', 2);
  				// var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
				geocoder.geocode({'location': latlng}, function(results, status) {
					
					if (status == google.maps.GeocoderStatus.OK) {

				        //Check result 0
						var result = results[0];
						//look for locality tag and administrative_area_level_1
						
						var homeAddress = result.formatted_address;
						var city = "";
						var state = "";
						var zipcode = "";
						var placeID = result.place_id;
						
						for(var i=0, len=result.address_components.length; i<len; i++) {
							var ac = result.address_components[i];
							console.log(ac);
							if(ac.types.indexOf("administrative_area_level_2") >= 0) city = ac.long_name;
							if(ac.types.indexOf("administrative_area_level_1") >= 0) state = ac.long_name;
							if(ac.types.indexOf("postal_code") >= 0) zipcode = ac.long_name;
						}
						//only report if we got Good Stuff
						if(homeAddress != '' &&  city != '' && zipcode != '' && placeID != '' && state != '') {
							var addressObject={};
							addressObject.homeAddress=homeAddress;
							addressObject.city=city;
							addressObject.zipcode=zipcode;
							addressObject.placeID=placeID;
							addressObject.homeLocationCoordinates = latlng;
							addressObject.state = state;
							deferred.resolve(addressObject);
						}
					}
					else{
						console.log(status)
					}
				});
			});
			return deferred.promise;
	   }
   }
  }]);
