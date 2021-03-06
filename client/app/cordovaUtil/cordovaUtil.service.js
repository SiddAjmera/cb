angular.module('cbApp')
  .service('cordovaUtil',['parse','Auth','httpRequest','localStorage','$q','$rootScope',function (parse,Auth,httpRequest,localStorage,$q,$rootScope) {
  var currentUser = {};
  var watchId;
  var deviceUUID;
  var almostFinished = false;
  var driveId;
 // currentUser=Auth.getCurrentUser();
  Auth.getCurrentUser().then(function(data){currentUser=data;});

   return {
	   getCoordinates:function(driveId)
	   {
		   var that=this;
		  	driveId=driveId;
			   watchId = navigator.geolocation.watchPosition(function(position)
			   {
				   // The onSuccess method for  Geolocation
				   // var myLatLag = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);	//Create a Google MAP
				   // var myoptions = { zoom: 14, center: myLatLag, mapTypeId: google.maps.MapTypeId.ROADMAP};	//Set option for map so that is use latlng center
				   // var map = new google.maps.Map(document.getElementById("mapCanvas"), myoptions);	//google map instance
				   // var marker = new google.maps.Marker({ position: myLatLag, map: map });	//add marker for our location
				   that.saveCoordinates(position,driveId);
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
	   
	   	saveCoordinates:function(position,driveId)
	   	{	
	   	   var that=this;
	   	   
	   	   console.log("My cordinates ",position);
		  
		   localStorage.retrieve('SavedLocationCoordinates').
		   then(function(item){
		   		   var mySavedLocationCoordinates = item;
		   		   var UUID;
		   		   if(deviceUUID != null) {
		   		   	//	alert('The deviceUUID is not null and is : ' + deviceUUID);
		   		   		UUID = deviceUUID;
		   		   }
		   		   else UUID = that.getDeviceUUID();
				   if(mySavedLocationCoordinates != null)
				   {
				   	   mySavedLocationCoordinates = JSON.parse(mySavedLocationCoordinates);	
					   var trackedLocationCoordinatesObject = {};	// Object to store the latitudes and longitudes of the current location
					   trackedLocationCoordinatesObject.location = {};
					   trackedLocationCoordinatesObject.location.latitude=position.coords.latitude;
					   trackedLocationCoordinatesObject.location.longitude=position.coords.longitude;	

					   trackedLocationCoordinatesObject.coords = {};
					   trackedLocationCoordinatesObject.coords.accuracy = position.coords.accuracy;
					   trackedLocationCoordinatesObject.coords.altitude = position.coords.altitude;
					   trackedLocationCoordinatesObject.coords.altitudeAccuracy = position.coords.altitudeAccuracy;
					   trackedLocationCoordinatesObject.coords.heading = position.coords.heading;
					   trackedLocationCoordinatesObject.coords.speed = position.coords.speed;

					   trackedLocationCoordinatesObject.timestamp=position.timestamp;		
					   trackedLocationCoordinatesObject.uuid=UUID;
					   trackedLocationCoordinatesObject.userId = currentUser.userId;
					   trackedLocationCoordinatesObject.driveId = driveId;
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

					   trackedLocationCoordinatesObject.coords = {};
					   trackedLocationCoordinatesObject.coords.accuracy = position.coords.accuracy;
					   trackedLocationCoordinatesObject.coords.altitude = position.coords.altitude;
					   trackedLocationCoordinatesObject.coords.altitudeAccuracy = position.coords.altitudeAccuracy;
					   trackedLocationCoordinatesObject.coords.heading = position.coords.heading;
					   trackedLocationCoordinatesObject.coords.speed = position.coords.speed;
					   
					   trackedLocationCoordinatesObject.timestamp=position.timestamp;
					   trackedLocationCoordinatesObject.userId = currentUser.userId;
					   trackedLocationCoordinatesObject.driveId = driveId;
					   trackedLocationCoordinatesObject.uuid=UUID;			   
					   trackedLocationCoordinatesObject.driveId = driveId;
					   //alert('current location object : ' + JSON.stringify(trackedLocationCoordinatesObject));
					   trackedLocationsArray.push(trackedLocationCoordinatesObject);
					   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocationsArray;
					   localStorage.store('SavedLocationCoordinates',JSON.stringify(objectToStoreTheTrackedLocationsArray)).
					   then(function(val){
					   	   var locationsObjectForMongoDB = window.localStorage.getItem('SavedLocationCoordinates');
						   //alert('This is the Current Location Object when localStorageObject is null: ' + val);
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
	   //device is a global variable, will be available on device after deviceReady event
	   	saveDeviceDetails:function(){
		   localStorage.store('Device', JSON.stringify(device)).then(function(device){
				return device;
			});
	   	},

	   	getDeviceUUID:function(){
	   	   	localStorage.retrieve('DeviceUUID').then(function(uuid){
	   			if(uuid != null){ 
	   				//alert('This is the UUID : ' + uuid);
	   				deviceUUID = uuid;
	   				return uuid;
	   			}
	   		});   	   	
	   	},
	   	setDeviceUUID:function (){
	   		if( angular.isDefined(device) && angular.isDefined(device.uuid)){
	   			localStorage.store('DeviceUUID', device.uuid).then(function(uuid){	   	   		
	   	   			deviceUUID = uuid;					
				});	
	   		}
	   		else{
	   			localStorage.store('DeviceUUID', "Desktop").then(function(uuid){	   	   		
	   	   			deviceUUID = "Desktop";
				});
	   		}	   		
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
	   		var that = this;
	   		httpRequest.post(config.apis.syncLocations, aBatch).
		   		then(function(res){
		   			if(res.status==201){
		   				localStorage.remove('SavedLocationCoordinates');
		   				if(almostFinished){
		   					if(config.cordova)
		   						that.showToastMessage("Data Synced Successfully")
		   					else
		   						alert('Data Synced Successfully');
		   					almostFinished =false;
		   				}
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
	   			while(trackedLocations.length > 0){
	   				if(trackedLocations.length <= 100){
	   					almostFinished = true;
	   					break;
	   				}
	   				else{
	   					httpRequest.post(config.apis.syncLocations,{trackedLocations:trackedLocations.splice(0, 100),almostFinished:almostFinished}).
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
	   			if(almostFinished) that.syncABatch({trackedLocations:trackedLocations,almostFinished:almostFinished});
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
						console.log("address reverse geocoder",results);
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
							var addressObject = {};
							addressObject.homeAddressLocation = {};
							addressObject.homeAddressLocation.location = [result.geometry.location.lat(),result.geometry.location.lng()];
							addressObject.homeAddressLocation.placeId = placeID;
							addressObject.homeAddressLocation.formatted_address = result.formatted_address;
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
	   },
	   
	   backbuttonImpl:function(){
		 
 				var exitApp = false;
                 
                 var intval = setInterval(function (){exitApp = false;}, 
1000);
   		 document.addEventListener("backbutton", function (e){
        e.preventDefault();
        if (exitApp) {
            clearInterval(intval) 
            navigator.notification.confirm("Are you sure you want to exit ?", onConfirm, "Confirmation", "Yes,No"); 
        }
        else {
            exitApp = true
            history.back(1);
        } 
    }, false);
        
 
           function onConfirm(button) {
			    if(button==2){//If User selected No, then we just do nothing
			    exitApp=false;
			        return;
			    }else{
			      //  navigator.app.exitApp();// Otherwise we quit the app.
			      (navigator.app && navigator.app.exitApp()) || (device && 
					device.exitApp())
  	  }
		}	
            
	   },
	   
	   checkNetConnection:function(){
		   var networkState = navigator.connection.type;
		   	 var states = {};
    states["Connection.UNKNOWN"]  = 'Unknown connection';
    states["Connection.ETHERNET"] = 'Ethernet connection';
    states["wifi"]     = 'WiFi connection';
    states["Connection.CELL_2G"]  = 'Cell 2G connection';
    states["Connection.CELL_3G"]  = 'Cell 3G connection';
    states["Connection.CELL_4G"]  = 'Cell 4G connection';
    states["Connection.CELL"]     = 'Cell generic connection';
    states["none"]     = 'No network connection';
	
	return states[networkState];
	   },
	   
	   showToastMessage:function(msg){
		   window.plugins.toast.showWithOptions(
    {
      message: msg,
      duration: "long",
      position: "center",
      addPixelsY: -40  // added a negative value to move it up a bit (default 0)
    },
    function(res){
		console.log(res)
	}, // optional
    function(err){
		console.log(err)
	}    // optional
  );
	   }
	   
   }
  }]);
