'use strict';

angular.module('cbApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'ngAnimate',
  'ngMessages',
  'ngTouch',
  'slick',
  'ui.bootstrap',
  'ngHamburger',
  'LocalForageModule',
  'leaflet-directive',
  'ui.select',
  'ngCordova',
  'angular-loading-bar',
  'google.places'
])

.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, cfpLoadingBarProvider) {
     console.log("In config block");

    //$locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    cfpLoadingBarProvider.includeSpinner = false;

    $urlRouterProvider
      .otherwise('/main');

  })

  .factory('authInterceptor', function ($rootScope, $q,$location,localStorage) {
    return {
      // Add authorization token to headers
      request: function (config) {
        var deferred = $q.defer();

        config.headers = config.headers || {};
        localStorage.retrieve('token').
        then(function(res){
          //console.log("header",res);
          if(res!=null)
             config.headers.Authorization = 'Bearer ' + res;
          /*console.log("config",config);
          return config;*/
          deferred.resolve(config);
        });
        return deferred.promise;

        /*if($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }*/

         //return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
       //   $location.path('/login');
          // remove any stale tokens
          localStorage.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth,localStorage,$state,cordovaUtil,cordovaInit) {
    //put all the cordova specific functionality
    if(config.cordova)
    {
      cordovaInit.loadGoogleMap();
      console.log(cordovaUtil.checkNetConnection())
      if(cordovaUtil.checkNetConnection()=='No network connection'){
        cordovaUtil.showToastMessage("Please check internet connection")
      }
    }
    ///console.log("In run block",localStorage.isInitialized());
    
   localStorage.isInitialized().then(function(val){
            if(val){
              // $location.path('/userHome/home');
            }
              
            else{
              localStorage.initialize();
              $location.path('/intro');
            }
          })

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next,nextPara,prev) {
      Auth.isLoggedInAsync(function(loggedIn) {
        console.log("loggedIn",loggedIn);
         console.log("next",next);
         console.log("prev",prev);

        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
         //logic to check if app is already initialized
        if(next.name=="intro"){
          localStorage.isInitialized().then(function(val){
            if(val)
               $state.go('main');
            else{
              localStorage.initialize();              
            }
         });
        }
      });
    });
  });

var onDeviceReady = function() {
    angular.bootstrap( document, ['cbApp']);
   
}
document.addEventListener('deviceready', 
onDeviceReady);

var acceptHandler=function(data){
    console.log(data);
    alert("Successs");
};
var rejectHandler=function(data){
    console.log(data);
    alert("Reject handler");
};

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  });
'use strict';

angular.module('cbApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window,$state) {
    $scope.user = {};
    $scope.loginForm = {};
    $scope.errorMsg = '';
    $scope.showErrorMessage = false;
    $scope.login = function() {
      $scope.errorMsg = '';
      $scope.showErrorMessage = true;
      if(!$scope.loginForm.$valid){   /*if form is invalid,return and show error messages */
            console.log($scope.loginForm) ;
            $("input.ng-invalid").eq(0).focus();      
            console.log("----------",$("input.ng-invalid"))
            return false;
      }
    

      else if($scope.loginForm.$valid) {
        console.log($scope.loginForm)
        Auth.login({
          empId: $scope.user.empId.toString(),
          password: $scope.user.password
        })
        .then(function(response) {
          if(response.status == 200){
             console.log(response)
             // Logged in, redirect to home
             $state.go('userHome.home');
          }
          else{
            $scope.errorMsg = "Please check Employee ID or Password"
          }
        },function(err){
           $scope.errorMsg = "Please check Employee ID or Password"
        })
        .catch( function(err) {
         $scope.errorMsg = "Please check Employee ID or Password"
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

    /*$scope.moveLabelUp = function(classContainer){
      //console.log('cc',classContainer);

      $("#"+classContainer).addClass('active');
      $("#"+classContainer+" input").focus();
    }
    $scope.moveLabelDown = function(classContainer,inputField){
      if($("#"+inputField).val().length<=0){
        $("#"+classContainer).removeClass('active');
      }
    }*/
    

  });
'use strict';

angular.module('cbApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
  });

'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', function ($scope, $location, $window, $state, $modal, $rootScope, cordovaUtil, httpRequest, localStorage, pushnotification, staticData) {
    $scope.user = {};
    $scope.user.gender = "Female";
    $scope.timeSlotJSON = [
                            "8:00 AM - 5:00 PM",
                            "9:00 AM - 6:00 PM",
                            "10:00 AM - 7:00 PM",
                            "11:00 AM - 8:00 PM",
                            "12:00 AM - 9:00 PM"
                          ];

    /*get tcs locations*/
    $scope.fieldtype = "password";
    $scope.officeAddressJSON = staticData.getTCSLocations();                              
    //cordovaUtil.setDeviceUUID(); 
    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.showErrorMessage = true;
    $scope.signupForm = {};    
        
    /*function to change field type*/
    $scope.changeFieldType = function(){
      $scope.fieldtype = $scope.fieldtype=="password"?"text":"password";
    }

    /*function for traversing between steps*/
    $scope.goToStep = function(step){
        if(step==currentStep)
          return;

        if(step>currentStep){
             if(!$scope.signupForm.$valid){
                $scope.showErrorMessage = false;
                return;
              }
              else{
                  $scope.showErrorMessage = true;
                  $scope.step = step;
                  currentStep = step;
                  if(step==1)
                    $state.go("signup.stepOne");
                  if(step==2)
                    $state.go("signup.stepTwo");
                  if(step==3)
                    $state.go("signup.stepThree");
              }
        }
        else{
             $scope.step = step;
             currentStep = step;
             $scope.showErrorMessage = true;
             if(step==1)
                  $state.go("signup.stepOne");
             if(step==2)
                  $state.go("signup.stepTwo");
        }

   }


   /*signup function called on form submit*/

    $scope.register = function() {     
      $scope.showErrorMessage = false;
      console.log($scope.signupForm);
      if(!$scope.signupForm.$valid){   /*if form is invalid,return and show error messages */
          console.log($scope.signupForm) ;
          $("input.ng-invalid").eq(0).focus();      
          console.log("----------",$("input.ng-invalid"))
          return false;
      }
      /*else save the data*/    
      // if device then register for push notification and save registarion ID.
      if(config.cordova){
        pushnotification.registerPushNotification().then(function(redgId){
          console.log('Reg id of device is ',redgId);
          $scope.user.redgId=redgId;
                $scope.signupPost();
          });          
      }
      else
        $scope.signupPost();
    }
       
      $scope.signupPost=function(){ 
        var url = config.apis.signup;
        httpRequest.post(url,$scope.user).
        then(function(response){
          if(response.status == 200){
            console.log('User Stored in the MongoDB Successfully. Here is the Response : ',response);
            localStorage.store('token',response.data.token).then(function(){
              $state.go("userHome.home");
            });
          }
        },function(err){
          console.log('Error Storing the User to the MongoDB. Here is the Error: ', err);
          $scope.error = err;
        });
      }

   

    $scope.getLocation=function(){
         var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'components/modal/modal.html',
          controller: 'ModalCtrl',
          size: 'sm'
        });
        
        modalInstance.result.then(function(option){
          if(option == "yes")
          cordovaUtil.getUserHomeCoordinates().then(function(address){
            $scope.user.homeAddress = address.homeAddress;
            $scope.user.city = address.city;
            if(address.zipcode)
              $scope.user.zipcode = parseInt(address.zipcode);
            $scope.user.placeID = address.placeID;
            $scope.user.homeLocationCoordinates = [];
            $scope.user.homeLocationCoordinates.push(address.homeLocationCoordinates.lng);
            $scope.user.homeLocationCoordinates.push(address.homeLocationCoordinates.lat);
            $scope.user.homeAddressLocation = address.homeAddressLocation;
            $scope.user.state = address.state;
          });
        });
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });

'use strict';

angular.module('cbApp')
  .controller('StepOneCtrl', function ($scope) {
    $scope.message = 'Hello';
  });

'use strict';

/*angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup.stepOne', {
        url: '/stepOne',
        templateUrl: 'app/account/signup/stepOne/stepOne.html'
      });
  });*/

'use strict';

angular.module('cbApp')
  .controller('StepThreeCtrl', function ($scope) {
    $scope.message = 'Hello';
  });

'use strict';
/*
angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup.stepThree', {
        url: '/stepThree',
        templateUrl: 'app/account/signup/stepThree/stepThree.html'
      });
  });*/

'use strict';

angular.module('cbApp')
  .controller('StepTwoCtrl', function ($scope) {
    $scope.message = 'Hello';
  });

'use strict';

/*angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup.stepTwo', {
        url: '/stepTwo',
        templateUrl: 'app/account/signup/stepTwo/stepTwo.html'
      });
  });*/

'use strict';

angular.module('cbApp')
  .controller('ActivitiesCtrl', function ($scope, $state, $stateParams) {
    $scope.message = 'Hello';

    $scope.team = $stateParams.team;

    $scope.getTeam = function(_id){
    	$state.go('teamDetails', {'team': $scope.team});
    }

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('activities', {
        templateUrl: 'app/activities/activities.html',
        params: {'team': null},
        controller: 'ActivitiesCtrl'
      });
  });

'use strict';

angular.module('cbApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  });
'use strict';

angular.module('cbApp')
  .controller('AvailableRidesCtrl', function ($scope,httpRequest,Auth,socket, cordovaUtil, $state) {
    console.log("Loading");
  	var currentUser = {};
  	$scope.rides = [];
    var rides=[];

    Auth.getCurrentUser().then(function(user){currentUser = user;getAvailableRides();})
    var populateSeats = function(ride){
      var seatMap = [];
      for(var i = 0 ; i < ride.initiallyAvailableSeats ; i++){       
        var seat = {};
        if(ride.riders[i]) seat._id = ride.riders[i]._id;        
        seatMap.push(angular.copy(seat));
        ride.seatMap=seatMap;        
      }
      return ride;
    }

    var updateRideStatus=function(event,item){
        var newRide=populateSeats(item);
        var oldRide=_.findWhere($scope.rides,{'_id':item._id});
        console.log("newRide,oldRide ",newRide,oldRide);
        if(oldRide){
          $scope.rides=_.reject($scope.rides,function(obj){
            return obj._id==oldRide._id;
          });                    
        }        
        $scope.rides.push(newRide);        
    };

    socket.syncUpdates('ride',[],function(event,item,array){
        console.log('item  ',item,event);
        updateRideStatus(event,item);
    });
  	var getAvailableRides = function(){
  		var apis = config.apis.filterRides;
  		var requestJSON = {};
      requestJSON.userId = currentUser.userId;
  		$scope.rides = [];
  		httpRequest.post(apis,requestJSON).
  		then(function(rides){
  			if(rides.status==200){
          rides = rides.data;
  				angular.forEach(rides, function(ride, key){
            var r = populateSeats(ride.obj)
            $scope.rides.push(r);  
  				});
  				console.log($scope.rides);
  			}
  		})
  	};

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }
    
  	$scope.selectRide = function(ride){
  		var apis = config.apis.selectRide + ride._id;
  		var requestJSON  = {};
  		requestJSON.companions = [];
  		angular.forEach(ride.seatMap, function(r, key){
  			if(angular.isDefined(r.selected) && r.selected){
  				var o = {};
  				o.userId = currentUser.userId;
          o.status = "PENDING";
  				requestJSON.companions.push(o);
          //requestJSON.companions.push(currentUser.userId);
  			}
  		});
  		
  		if(requestJSON.companions.length==0){
  			 if(config.cordova) cordovaUtil.showToastMessage("Select atleast one seat")
         else alert("Select atleast one seat");
         return;
  		}
  		
  		requestJSON.availableSeats=ride.availableSeats-requestJSON.companions.length;
  		
  		httpRequest.put(apis,requestJSON).
  		then(function(response){
        console.log(response);
  			if(response.status==201){
  				/*ride selected successfully. Show notification to ride owner*/
          if(config.cordova) cordovaUtil.showToastMessage('Your ride has been booked successfully.');
          else alert('Your ride has been booked successfully.');
          $state.go('userHome.rideStatus');
  			}else if(response.status==409){
          if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
          else alert('You are already part of an Active Ride');
          $state.go('userHome.rideStatus');
        }
  		},function(err){
            console.log("err",err);

             if(err.status==409){
                  if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
                  else alert('You are already part of an Active Ride');
                  $state.go('userHome.rideStatus');
            }
        })
  	}

  	$scope.selectSeat = function(seat){
  		if(seat._id)
  			return;

  		if(angular.isDefined(seat.selected))
  			seat.selected=!seat.selected;
  		else
  			seat.selected = true;
  	}


    
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.availableRides', {
        url: '/availableRides',
        templateUrl: 'app/availableRides/availableRides.html',
        controller: 'AvailableRidesCtrl',
        authenticate:true
      });
  });

if(angular.isUndefined(config)){
	var config = {};
	config.apis = {};
}


//base URL for API

//config.apiBaseURL="http://localhost:9000/";
config.apiBaseURL="http://52.77.218.140:9000/";
//config.apiBaseURL="http://192.168.44.66:9000/"


/*apis start from here*/

config.apis.login = "auth/local";
config.apis.syncLocations = "api/locations";
config.apis.getAllUsers = "api/users/";
config.apis.signup = "api/users/";
/*for filtering*/
config.apis.filterLocations = "api/locations/FilterLocation";
config.apis.getStats = "api/drives/FilterDrive";
config.apis.getDrives = "api/drives/LatestDriveId";


/*ride apis*/
config.apis.postRide = "api/rides/";
config.apis.filterRides = "api/rides/GetAvailableRides";
config.apis.selectRide = "api/rides/AddCompanionToRide/";
config.apis.latestActiveRideOfUser = "api/rides/GetLatestActiveRide";
config.apis.cancelRide = "api/rides/CancelRide/";
config.apis.rescheduleRide = "api/rides/RescheduleRide/";
config.apis.deleteRide = "api/rides/";

/*team apis*/
config.apis.createTeam = "api/teams/";
config.apis.getUserTeams = "api/teams/TeamsOfUser";
config.apis.getTeamDetails = "api/teams/";

config.cordova=true;

//"cwseZgmg0n8:APA91bGe_gDw-upSJz4cnRfbv0mvZoqOIYN8K-q_EeGfReZ372QNjxqHvXfyZTCl-kAtfORda3dBeHbqJVoiCBvvEC7cXoqaxiE8bKaXg_zNMmGHb3ZtFHPym9_I-gwRbFCYDfLwEAsW"


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
				if(textStatus=="success"){
					googleMapLoaded=true;
					$interval.cancel(interval)
				}
				
			})
	      }
	    }, 3000);
		 
	 }
	
}
	   
	});

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

'use strict';

angular.module('cbApp')
  .controller('CurrentRideCtrl', function ($scope) {
    $scope.message = 'Hello';
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('currentRide', {
        url: '/currentRide',
        templateUrl: 'app/currentRide/currentRide.html',
        controller: 'CurrentRideCtrl'
      });
  });

'use strict';

angular.module('cbApp')
  .service('filterService', function () {

  	return{
  		filterData:function (pathArr,threshold) {
  			var curr,prev;
	        var resultArr=[];
	        for(var i=0;i<pathArr.length;i++){
	            curr=pathArr[i];
	            if(prev){
	            var p1={
	            "type": "Feature",
	            "properties": {},
	            "geometry": {
	                "type": "Point",
	                "coordinates": [curr.lng, curr.lat]
	            }
	            }
	             var p2={
	            "type": "Feature",
	            "properties": {},
	            "geometry": {
	                "type": "Point",
	                "coordinates": [prev.lng, prev.lat]
	            }
	            }
	            
	            var distance = turf.distance(p1, p2);
	            if(distance<threshold)
	            {
	                resultArr.push(curr);
	            }
	            }
	            prev=curr;
	        }
	     return resultArr;
  		},
  		GDouglasPeucker:function(source, kink) {
		  	var	n_source, n_stack, n_dest, start, end, i, sig;    
		    var dev_sqr, max_dev_sqr, band_sqr;
		    var x12, y12, d12, x13, y13, d13, x23, y23, d23;
		    var F = ((Math.PI / 180.0) * 0.5 );
		    var index = new Array(); /* aray of indexes of source points to include in the reduced line */
			var sig_start = new Array(); /* indices of start & end of working section */
		    var sig_end = new Array();	

		    /* check for simple cases */

		    if ( source.length < 3 ) 
		        return(source);    /* one or two points */

		    /* more complex case. initialize stack */
				
			n_source = source.length;
		    band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0);	/* Now in degrees */
		    band_sqr *= band_sqr;
		    n_dest = 0;
		    sig_start[0] = 0;
		    sig_end[0] = n_source-1;
		    n_stack = 1;

		    /* while the stack is not empty  ... */
		    while ( n_stack > 0 ){
		    
		        /* ... pop the top-most entries off the stacks */

		        start = sig_start[n_stack-1];
		        end = sig_end[n_stack-1];
		        n_stack--;

		        if ( (end - start) > 1 ){  /* any intermediate points ? */        
		                    
		                /* ... yes, so find most deviant intermediate point to
		                       either side of line joining start & end points */                                   
		            
		            x12 = (source[end].lng - source[start].lng);
		            y12 = (source[end].lat - source[start].lat);
		            if (Math.abs(x12) > 180.0) 
		                x12 = 360.0 - Math.abs(x12);
		            x12 *= Math.cos(F * (source[end].lat + source[start].lat));/* use avg lat to reduce lng */
		            d12 = (x12*x12) + (y12*y12);

		            for ( i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++ ){                                    

		                x13 = (source[i].lng - source[start].lng);
		                y13 = (source[i].lat - source[start].lat);
		                if (Math.abs(x13) > 180.0) 
		                    x13 = 360.0 - Math.abs(x13);
		                x13 *= Math.cos (F * (source[i].lat + source[start].lat));
		                d13 = (x13*x13) + (y13*y13);

		                x23 = (source[i].lng - source[end].lng);
		                y23 = (source[i].lat - source[end].lat);
		                if (Math.abs(x23) > 180.0) 
		                    x23 = 360.0 - Math.abs(x23);
		                x23 *= Math.cos(F * (source[i].lat + source[end].lat));
		                d23 = (x23*x23) + (y23*y23);
		                                
		                if ( d13 >= ( d12 + d23 ) )
		                    dev_sqr = d23;
		                else if ( d23 >= ( d12 + d13 ) )
		                    dev_sqr = d13;
		                else
		                    dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12;// solve triangle

		                if ( dev_sqr > max_dev_sqr  ){
		                    sig = i;
		                    max_dev_sqr = dev_sqr;
		                }
		            }

		            if ( max_dev_sqr < band_sqr ){   /* is there a sig. intermediate point ? */
		                /* ... no, so transfer current start point */
		                index[n_dest] = start;
		                n_dest++;
		            }
		            else{
		                /* ... yes, so push two sub-sections on stack for further processing */
		                n_stack++;
		                sig_start[n_stack-1] = sig;
		                sig_end[n_stack-1] = end;
		                n_stack++;
		                sig_start[n_stack-1] = start;
		                sig_end[n_stack-1] = sig;
		            }
		        }
		        else{
		                /* ... no intermediate points, so transfer current start point */
		                index[n_dest] = start;
		                n_dest++;
		        }
		    }

		    /* transfer last point */
		    index[n_dest] = n_source-1;
		    n_dest++;

		    /* make return array */
		    var r = new Array();
		    for(var i=0; i < n_dest; i++)
		        r.push(source[index[i]]);
		    return r;
  		}
  	}
    // AngularJS will instantiate a singleton by calling "new" on this function
  });

'use strict';

angular.module('cbApp')
  .controller('FormTeamCtrl', function ($scope, $state, Auth, staticData, httpRequest) {
    $scope.message = 'Hello';
    var routes;
    
    var fromLocation = [];
    var toLocation = [];
    var from, to;

    var directionsService = new google.maps.DirectionsService();

    $scope.officeAddressJSON = staticData.getTCSLocations();

    $scope.$on('leafletDirectivePath.analyzeon.mousedown', function(event, path){
        console.log("%cGot leafletObject Message : " + path.leafletObject.options.message,"color:green;");
        $scope.routeSummary = path.leafletObject.options.message;
    });

    $scope.$on('leafletDirectivePath.analyzeon.click', function(event, path){
        console.log("%cGot path as : "+path,"background-color:green");
        console.log("Got leafletObject Message : ", path.leafletObject.options.message);
        $scope.routeSummary = path.leafletObject.options.message;
    });

    $scope.timeSlotJSON =   [
    							{'start':'8:00 AM','end':'5:00 PM'},
    							{'start':'9:00 AM','end':'6:00 PM'},
    							{'start':'10:00 AM','end':'7:00 PM'},
    							{'start':'11:00 AM','end':'8:00 PM'},
    							{'start':'12:00 AM','end':'9:00 PM'},                                
                            ];

    $scope.defaults = {
      minZoom:0,
      maxZoom:22,
      tap:true,
      tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    };

    $scope.center = {
      lat : 18.581904504725568,
      lng : 73.68483066558838,
      zoom: 14
    };

    $scope.mypath = {};
    var getRoute = function (from, to) {
        var request = {};
        request.optimizeWaypoints = true;
        request.provideRouteAlternatives = true;
        request.travelMode = google.maps.TravelMode.DRIVING;
        request.origin = from;
        request.destination = to;
        console.log("Request Object to Direction Service : ", request);
        directionsService.route(request, function(response, status) {
            console.log("response",response)
            if (status == google.maps.DirectionsStatus.OK) {
                
                //var routes = _.map(response.routes,function(r){return r.overview_polyline});

                routes = _.map(response.routes,function(r){

                    console.log("r : ", r);
                    console.log("r.summary : ", r.summary);

                    return  {
                                polyline: r.overview_polyline,
                                via: r.summary
                            }
                });

                console.log("routes",routes);              
                angular.forEach(routes,function(r,key){
                    var routeObj = {};
                    routeObj.color = '#'+Math.floor(Math.random()*16777215).toString(16);
                    routeObj.weight = 8;
                    routeObj.latlngs = L.Polyline.fromEncoded(r.polyline).getLatLngs();
                    routeObj.clickable = true;
                    routeObj.message = r.via;
                    $scope.mypath['r'+key] = routeObj; 
                  //latArr.push(L.Polyline.fromEncoded(r).getLatLngs());
                });              
               //$scope.mypath ={};
               //$scope.mypath.multiPolyline={type:"multiPolyline",latlngs:latArr};
                console.log('in req ',$scope.mypath);                
                console.log('enter!');  
            }
        }); 
    };

    $scope.team = {};
    $scope.team.teamName = "Morning Commute";
    $scope.team.rideDetails = {};
    $scope.team.rideDetails.from = {};
    $scope.team.rideDetails.to = {};

    var currentUser = {};
	Auth.getCurrentUser(true)
    	.then(function(data){
        	$scope.user = data;
            
            if($scope.user.homeAddressLocation){
                $scope.team.rideDetails.from = $scope.user.homeAddressLocation;
                fromLocation.push($scope.team.rideDetails.from.location[1]);
                fromLocation.push($scope.team.rideDetails.from.location[0]);
                from = fromLocation.join();
            }
            
            if($scope.user.officeAddressLocation){
                $scope.team.rideDetails.to = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
                toLocation.push($scope.team.rideDetails.to.location[1]);
                toLocation.push($scope.team.rideDetails.to.location[0]);
                to = toLocation.join();
            }
            if($scope.user.shiftTimeIn) $scope.team.rideDetails.ridePreferredTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
            if(from && to) getRoute(from, to);
    	});

    $scope.$watch('team.rideDetails.from', function(newValue, oldValue, scope) {
        if(newValue != oldValue){
            $scope.team.rideDetails.from.display_address = $scope.team.rideDetails.from.name;
            $scope.team.rideDetails.from.formatted_address = $scope.team.rideDetails.from.formatted_address;
            $scope.team.rideDetails.from.icon = $scope.team.rideDetails.from.icon;
            $scope.team.rideDetails.from.placeId = $scope.team.rideDetails.from.place_id;
            $scope.team.rideDetails.from.location = [];
            $scope.team.rideDetails.from.location.push($scope.team.rideDetails.from.geometry.location.lng());
            $scope.team.rideDetails.from.location.push($scope.team.rideDetails.from.geometry.location.lat());

            delete $scope.team.rideDetails.from.address_components;
            delete $scope.team.rideDetails.from.adr_address;
            delete $scope.team.rideDetails.from.geometry;
            delete $scope.team.rideDetails.from.html_attributions;
            delete $scope.team.rideDetails.from.id;
            delete $scope.team.rideDetails.from.name;
            delete $scope.team.rideDetails.from.place_id;
            delete $scope.team.rideDetails.from.reference;
            delete $scope.team.rideDetails.from.reviews;
            delete $scope.team.rideDetails.from.scope;
            delete $scope.team.rideDetails.from.types;
            delete $scope.team.rideDetails.from.url;
            delete $scope.team.rideDetails.from.user_ratings_total;
            delete $scope.team.rideDetails.from.utc_offset;
            delete $scope.team.rideDetails.from.vicinity;
            delete $scope.team.rideDetails.from.__proto__;

            fromLocation = [];
            fromLocation.push($scope.team.rideDetails.from.location[1]);
            fromLocation.push($scope.team.rideDetails.from.location[0]);
            from = fromLocation.join();
            to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            if(from && to) getRoute(from, to);
        }
    });

    $scope.$watch('team.rideDetails.to', function(newValue, oldValue, scope) {
        if(newValue != oldValue){
            toLocation = [];
            toLocation.push($scope.team.rideDetails.to.location[1]);
            toLocation.push($scope.team.rideDetails.to.location[0]);
            from = fromLocation.join();
            to = toLocation.join();
            console.log("From is " + from + " and to is " + to);
            if(from && to) getRoute(from, to);
        }
    });

    $scope.findTeamMembers = function(){
        var teamObject = {};
        teamObject.team = $scope.team;
        teamObject.team.rideDetails.ridePreferredTimeHToO = $scope.team.rideDetails.ridePreferredTime.start;
        teamObject.team.rideDetails.ridePreferredTimeOToH = $scope.team.rideDetails.ridePreferredTime.end;

        if(!$scope.routeSummary && routes.length > 1){
            if(config.cordova) cordovaUtil.showToastMessage("Please select a route before proceeding!")
            else alert("Please select a route before proceeding");
            return false;
        }

        teamObject.team.rideDetails.routeSummary = $scope.routeSummary;
        console.log("Final Team Object Before Find Team Memebers : ", teamObject);

        //For the case when the User directly visits the Form Team Page.
        var url = config.apis.signup + $scope.user._id;
        if(!$scope.user.homeAddressLocation && !scope.user.officeAddressLocation){
            var obj = {};
            obj.homeAddressLocation = $scope.team.rideDetails.from;
            obj.officeAddressLocation = $scope.team.rideDetails.to;
            obj.shiftTimeIn = $scope.team.rideDetails.ridePreferredTime.start;
            obj.shiftTimeout = $scope.team.rideDetails.ridePreferredTime.end;

            httpRequest.post(url, obj)
                       .then(function(data){
                            if(data.status === 200){
                                if(config.cordova) cordovaUtil.showToastMessage('Your information has been stored successfully.');
                                else alert('Your information has been stored successfully.');
                            }
                       });

        }

        $state.go('userHome.suggestions', {'team': teamObject});
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  });
'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('formTeam', {
        url: '/formTeam',
        templateUrl: 'app/formTeam/formTeam.html',
        controller: 'FormTeamCtrl'
      });
  });

'use strict';

angular.module('cbApp')
  .controller('HomeCtrl', function ($scope, Auth, httpRequest, $state, filterService) {
    $scope.defaults={minZoom:10, maxZoom:15,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" };  
    $scope.center={
      lat : 18.581904504725568,
      lng : 73.68483066558838,
      zoom: 15
    };
    $scope.setCenter=true;
    $scope.paths={};
    var currentUser = {};
     Auth.getCurrentUser(true).
     then(function(data){
        currentUser = data;
        //getDrives(10);
        $scope.firstName = currentUser.empName.split(" ")[0];
        console.log("First Name  ", currentUser.firstName);
        console.log(currentUser)
     });
    var getLocations = function(driveId){
       $scope.paths = {};
        var filterJSON = {};
        filterJSON.driveId = driveId;
        filterJSON.userId = currentUser.userId;

        httpRequest.post(config.apis.filterLocations,filterJSON).
        then(function(response) {
             console.log("locations",response);
            if(response.status==200 && response.data.length > 0){

                    var pathArr=[];

                    angular.forEach(response.data, function(location, key){
                        pathArr.push({lat:location.location.latitude,lng:location.location.longitude});

                    });
                    console.log("pathArr",pathArr)
                    if($scope.setCenter){
                            $scope.center=pathArr[0];
                            $scope.setCenter=false;
                    }
                     $scope.paths={
                             p1: {
                        color: '#008000',
                        weight: 8,
                        latlngs:pathArr
                        }

                       }
            console.log("filtered data",filterService.GDouglasPeucker(pathArr,20));
            }
        })
    }

    $scope.openMyTeam = function(){
      $state.go('myteams');
    }

    $scope.postRide=function () {
      if(currentUser.homeAddressLocation && currentUser.officeAddressLocation && currentUser.vehicle[0] && currentUser.shiftTimeIn && currentUser.shiftTimeout){
        $state.go('userHome.postRides');        
      }
      else{
        $state.go('userHome.rideDetails',{'for':'postRides'});
      }

    }
    $scope.takeRide=function () {
      if(currentUser.homeAddressLocation && currentUser.officeAddressLocation && currentUser.shiftTimeIn && currentUser.shiftTimeout){
        $state.go('userHome.availableRides');
      }
      else{
        $state.go('userHome.rideDetails',{'for':'takeRide'});
      }
    }

    $scope.toggleFooter = function(){
     
      $(".home-page-menu-options").slideToggle(250);
      
    }

    var drivesArray = [];
    var totalDrives =  0;
    var currentDrive = 0;
    var getDrives = function(limit){
      var postJSON = {}
      postJSON.userId = currentUser.userId;
      postJSON.limit = limit;

      httpRequest.post(config.apis.getDrives,postJSON).
      then(function(drives){
        console.log(drives)
        if(drives.status==200){
           drivesArray = drives.data;
           totalDrives = drives.data.length;
           if(drivesArray.length!=0){

              getLocations(drivesArray[currentDrive]);
              getStats(drivesArray[currentDrive]);
              currentDrive++;
           }
               
        }
         
      })
    }

    $scope.getNextDrive = function(){
      console.log("currentDrive in next",currentDrive);
      currentDrive++;
      if(currentDrive<=totalDrives-1){
        getStats(drivesArray[currentDrive])
        getLocations(drivesArray[currentDrive]);
      }else
        currentDrive--;
    }

    $scope.getPrevDrive = function(){
       console.log("currentDrive in prev",currentDrive);
       currentDrive--;
      if(currentDrive>=0){

        getStats(drivesArray[currentDrive])
        getLocations(drivesArray[currentDrive])

       }else
        currentDrive=0;
    }

    var getStats = function(driveId){
        var filterJSON = {};
        $scope.stats = {}
        filterJSON.driveId = driveId;
        filterJSON.userId = currentUser.userId;

        httpRequest.post(config.apis.getStats,filterJSON).
        then(function(stats){
            if(stats.status==200){
              $scope.stats = stats.data[0];
            }
        })
    }

   
    
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.home', {
        url: '/home',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl',
        authenticate:true

      });
  });

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
      },
      delete: function(url){
          var promise;
          var req = {};
          req.url = config.apiBaseURL + url;
          req.method = 'DELETE';
          promise = $http(req).
                    then(function(response){
                        return response;
                    });
          return promise;
      }
    }
   }
  ]);
'use strict';

angular.module('cbApp')
  .controller('IntroCtrl', function ($scope) {
    $scope.message = 'Hello';
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('intro', {
        url: '/intro',
        templateUrl: 'app/intro/intro.html',
        controller: 'IntroCtrl'
      });
  });
    /*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );
// EventListener | @jon_neal | //github.com/jonathantneal/EventListener
!window.addEventListener && window.Element && (function () {
    function addToPrototype(name, method) {
        Window.prototype[name] = HTMLDocument.prototype[name] = Element.prototype[name] = method;
    }
 
    var registry = [];
 
    addToPrototype("addEventListener", function (type, listener) {
        var target = this;
 
        registry.unshift({
            __listener: function (event) {
                event.currentTarget = target;
                event.pageX = event.clientX + document.documentElement.scrollLeft;
                event.pageY = event.clientY + document.documentElement.scrollTop;
                event.preventDefault = function () { event.returnValue = false };
                event.relatedTarget = event.fromElement || null;
                event.stopPropagation = function () { event.cancelBubble = true };
                event.relatedTarget = event.fromElement || null;
                event.target = event.srcElement || target;
                event.timeStamp = +new Date;
 
                listener.call(target, event);
            },
            listener: listener,
            target: target,
            type: type
        });
 
        this.attachEvent("on" + type, registry[0].__listener);
    });
 
    addToPrototype("removeEventListener", function (type, listener) {
        for (var index = 0, length = registry.length; index < length; ++index) {
            if (registry[index].target == this && registry[index].type == type && registry[index].listener == listener) {
                return this.detachEvent("on" + type, registry.splice(index, 1)[0].__listener);
            }
        }
    });
 
    addToPrototype("dispatchEvent", function (eventObject) {
        try {
            return this.fireEvent("on" + eventObject.type, eventObject);
        } catch (error) {
            for (var index = 0, length = registry.length; index < length; ++index) {
                if (registry[index].target == this && registry[index].type == eventObject.type) {
                    registry[index].call(this, eventObject);
                }
            }
        }
    });
})();


'use strict';

angular.module('cbApp')
  .service('localStorage', ['$localForage',function ($localForage) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    return{

    	isInitialized:function(){
             var that = this;
    		 return that.retrieve('init').
                     then(function(item){
                        //console.log("item",item);
                        return item;
                     });
    	},
    	initialize:function(){
            var that = this;
    		that.store('init',true);
    	},
        store:function(key,item){
            return $localForage.setItem(key,item);
        },
        retrieve:function(key){
            return $localForage.getItem(key);
        },
        remove:function(key){
            return $localForage.removeItem(key);
        }
    }

  }]);

'use strict';

angular.module('cbApp')
  .controller('MainCtrl', function ($scope, $http, socket, cordovaUtil, $state, localStorage) {

   
	 // cordovaUtil.setDeviceUUID();
	  $scope.saveDeviceInfo=function()
	  {
		  cordovaUtil.saveDeviceDetails();
	  }
	  

    $scope.openMap = function(){
      $state.go('map');
    }

	  $scope.startTracking=function(){
		  
		  cordovaUtil.getCoordinates();
	  }

    $scope.fetch = function(){
      if(config.cordova)
        cordovaUtil.showToastMessage("Sync started");
      console.log("Syncing")
      cordovaUtil.batchSync();
    }

    $scope.gotoLogin=function () {
      $state.go('login');
    }

    $scope.openSignupForm = function(){
      $state.go('signup');
    }
	  


  /*  $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    }); */
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/main',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'      
      });
  });
'use strict';

angular.module('cbApp')
  .controller('MapCtrl', function ($scope,cordovaUtil) {
     $scope.startTracking=function(){
		  
		  cordovaUtil.getCoordinates();
	  }

	  
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('map', {
        url: '/map',
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  });

'use strict';

angular.module('cbApp')
  .controller('MyteamsCtrl', function ($scope, $location, $state, Auth, httpRequest) {
    $scope.message = 'Hello';
    var currentUser;
    Auth.getCurrentUser().then(function(user){
    	currentUser = user;
    	getUserTeams();
    });

    $scope.toggleFooter = function(){
        $(".home-page-menu-options").slideToggle(250);
    }

    $scope.openteamDetails = function(_id){
    	$state.go('teamDetails', {'teamId': _id});
    }

    var getUserTeams = function(){
    	var apis = config.apis.getUserTeams;
  		$scope.teams = [];
  		httpRequest.get(apis).
  		then(function(teams){
  			if(teams.status == 200){
          		teams = teams.data;
  				$scope.teams = teams;
  				console.log($scope.teams);
  			}
  			else if(teams.status == 404){
  				alert("It's lonely in here. Please create a team to see it here");
  			}
  		});
    }

    $scope.goToCreateTeamPage = function(){
      $state.go('formTeam');
    }

});

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myteams', {
        url: '/myteams',
        templateUrl: 'app/myteams/myteams.html',
        controller: 'MyteamsCtrl'
      });
  });

'use strict';

angular.module('cbApp')
  .service('parse', function ($q) {
   return {
   		saveObject:function(object,data){
   			console.log(object,data);
   			var tmpobj = Parse.Object.extend(object);
		   	var testObject = new tmpobj();
			//return testObject.save({"coordinates":[]})
        return testObject.save(data);
   		},
   		getObjects:function(object){
   			var tmpobj = Parse.Object.extend("coordinatesObj");
        var query = new Parse.Query("coordinatesObj");
        return query.find()
   			/*var testObject = new tmpobj();
   			return testObject.fetch();*/
   		},
   		addObjects:function(object,data){
   				var tmpobj = Parse.Object.extend(object);
		   		var testObject = new tmpobj();
		   		testObject.add("coordinates",data)
		   		return testObject.save();
   		}
   };
  });

'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope, httpRequest, Auth, cordovaUtil, staticData, $state) {
    var directionsService = new google.maps.DirectionsService();
    
    /*$scope.$on('leafletDirectiveMap.click', function(event){
        console.log("Click hua with event object : ", event);
    });*/

    $scope.$on('leafletDirectivePath.analyzeon.mousedown', function(event, path){
        console.log("%cGot leafletObject Message : " + path.leafletObject.options.message,"color:green;");
        $scope.routeSummary = path.leafletObject.options.message;
    });

    $scope.$on('leafletDirectivePath.analyzeon.click', function(event, path){
        console.log("%cGot path as : "+path,"background-color:green");
        console.log("Got leafletObject Message : ", path.leafletObject.options.message);
        $scope.routeSummary = path.leafletObject.options.message;
    });

    $scope.rideData = {};
    $scope.rideData.from = 'Home';
    $scope.rideData.to = 'Office';
    $scope.rideData.leavingIn = '15';
    $scope.rideData.availableSeats = 1;
    var routes;
    
    $scope.mypath = {};
    var getRoute = function (from, to) {
        var request = {};
        request.optimizeWaypoints = true;
        request.provideRouteAlternatives = true;
        request.travelMode = google.maps.TravelMode.DRIVING;
        request.origin = from;
        request.destination = to;
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                routes = _.map(response.routes,function(r){

                    console.log("r : ", r);
                    console.log("r.summary : ", r.summary);

                    return  {
                                polyline: r.overview_polyline,
                                via: r.summary
                            }
                });
                console.log("routes", routes);              
                angular.forEach(routes,function(r,key){
                    var routeObj = {};
                    routeObj.color = '#'+Math.floor(Math.random()*16777215).toString(16);
                    routeObj.weight = 8;
                    routeObj.latlngs = L.Polyline.fromEncoded(r.polyline).getLatLngs();
                    routeObj.clickable = true;
                    routeObj.message = r.via;
                    $scope.mypath['r'+key] = routeObj; 
                    //latArr.push(L.Polyline.fromEncoded(r).getLatLngs());
                });              
                //$scope.mypath ={};
                //$scope.mypath.multiPolyline={type:"multiPolyline",latlngs:latArr};
                console.log('in req ',$scope.mypath);
            }
        }); 
    }
    
    var currentUser;
    Auth.getCurrentUser().
    then(function(data){
        currentUser = data;
        console.log('Current User : ', currentUser);

        var maxAvailableSeats = currentUser.vehicle[0].capacity - 1;

        $scope.availableSeatsJSON = [];
        for(var i=1; i <= maxAvailableSeats; i++){
            $scope.availableSeatsJSON.push(i.toString());
        }

        $scope.rideData.availableSeats = (currentUser.vehicle[0].capacity - 1).toString();
        console.log("$scope.rideData.availableSeats : ", $scope.rideData.availableSeats);

        console.log("$scope.rideData",$scope.rideData);
        
        var fromLocation = [];
        fromLocation.push(currentUser.homeAddressLocation.location[1]);
        fromLocation.push(currentUser.homeAddressLocation.location[0]);
        var toLocation = [];
        toLocation.push(currentUser.officeAddressLocation.location[1]);
        toLocation.push(currentUser.officeAddressLocation.location[0]);
                
        var from = fromLocation.join();
        var to = toLocation.join();
        getRoute(from, to);
    });

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }

    
    //Multiple Routes Code - start
    $scope.$watch('rideData.to', function(newValue, oldValue, scope) {
        if(currentUser){
            if(newValue == "Home"){
                var fromLocation = [];
                fromLocation.push(currentUser.officeAddressLocation.location[1]);
                fromLocation.push(currentUser.officeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.homeAddressLocation.location[1]);
                toLocation.push(currentUser.homeAddressLocation.location[0]);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                getRoute(from, to);
            }
            else{
                var fromLocation = [];
                fromLocation.push(currentUser.homeAddressLocation.location[1]);
                fromLocation.push(currentUser.homeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.officeAddressLocation.location[1]);
                toLocation.push(currentUser.officeAddressLocation.location[0]);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                getRoute(from, to);
            }
        }
    });

    $scope.$watch('rideData.from', function(newValue, oldValue, scope) {
        if(currentUser){
            if(newValue == "Home"){
                var fromLocation = [];
                fromLocation.push(currentUser.homeAddressLocation.location[1]);
                fromLocation.push(currentUser.homeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.officeAddressLocation.location[1]);
                toLocation.push(currentUser.officeAddressLocation.location[0]);
                console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                console.log("From is " + from + " and to is " + to);
                getRoute(from, to);
            }
            else{
                var fromLocation = [];
                fromLocation.push(currentUser.officeAddressLocation.location[1]);
                fromLocation.push(currentUser.officeAddressLocation.location[0]);
                var toLocation = [];
                toLocation.push(currentUser.homeAddressLocation.location[1]);
                toLocation.push(currentUser.homeAddressLocation.location[0]);
                console.log("FromLocation is " + fromLocation + " and toLocation is " + toLocation);
                
                var from = fromLocation.join();
                var to = toLocation.join();
                console.log("From is " + from + " and to is " + to);
                getRoute(from, to);
            }
        }
    });

    console.log("$scope.rideData",$scope.rideData);

    $scope.defaults = {
      minZoom:0,
      maxZoom:22,
      tap:true,
      tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    };

    $scope.center = {
      lat : 18.581904504725568,
      lng : 73.68483066558838,
      zoom: 15
    };
    var latArr = [];
    
    var request = {
          origin: "37.891586,-4.7844853",
          destination: "38.891586,-5.7844853",
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        };

   
    //Multiple Routes Code - end
    $scope.ride = {};
    /*get tcs locations*/   
    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.showErrorMessage = false;
    $scope.leavingInJSON =  [
                                {"text":"05 MIN","value":"5"},
                                {"text":"10 MIN","value":"10"},
                                {"text":"15 MIN","value":"15"},
                                {"text":"20 MIN","value":"20"},
                                {"text":"25 MIN","value":"25"},
                                {"text":"30 MIN","value":"30"},
                                {"text":"35 MIN","value":"35"},
                                {"text":"40 MIN","value":"40"},
                                {"text":"45 MIN","value":"45"},
                                {"text":"50 MIN","value":"50"},
                                {"text":"55 MIN","value":"55"},
                                {"text":"60 MIN","value":"60"},
                            ];

    $scope.autocompleteOptions = {
                        types: ['(cities)'],
                        componentRestrictions: { country: 'IN',city:'Pune' },
                    }

    
    $scope.fromChanged = function(option){
        (option == "Home") ? $scope.rideData.to = "Office" : $scope.rideData.to = "Home";
    }

    $scope.toChanged = function(option){
        (option == "Home") ? $scope.rideData.from = "Office" : $scope.rideData.from = "Home";
    }

    $scope.address='default'
    $scope.addressTo='default'
    $scope.optionAddressOptions=function(option){
        $scope.open=option;
        if(option=="from") $scope.ride.source=undefined;
        else $scope.ride.destination=undefined;
    }
     $scope.showAddressFrom=function(option){
        console.log(option)
        $scope.address = option;
        if($scope.address == "home") $scope.ride.source = currentUser.homeAddress;
        $scope.otherAddress = true;
        $scope.open = false;
    }
    $scope.showAddressTo=function(option){
        console.log(option)
        $scope.addressTo = option;
        if($scope.addressTo == "homeTo") $scope.ride.destination= currentUser.homeAddress;
        $scope.otherAddress = true;
        $scope.open = false;
    }
    $scope.postRide = function(){
        console.log("ride object",$scope.ride);
        var ride = {};
        if($scope.rideData.from=="Other"){
            ride.startLocation = {
                                    formatted_address:$scope.ride.source.formatted_address,
                                    display_address : $scope.ride.destination.name,
                                    location:[$scope.ride.source.geometry.location.lng(),$scope.ride.source.geometry.location.lat()],
                                    placeId:$scope.ride.source.place_id,
                                    icon : $scope.ride.source.icon 
                                };
        
        }
        else if($scope.rideData.from == "Home"){
            ride.startLocation = currentUser.homeAddressLocation;
        }
        else if($scope.rideData.from == "Office"){
             ride.startLocation = currentUser.officeAddressLocation;
        }
        if($scope.rideData.to == "Other"){
            ride.endLocation =  {
                                    formatted_address : $scope.ride.destination.formatted_address,
                                    display_address : $scope.ride.destination.name,
                                    location : [$scope.ride.destination.geometry.location.lng(),$scope.ride.destination.geometry.location.lat()],
                                    placeId : $scope.ride.destination.place_id,
                                    icon : $scope.ride.destination.icon 
                                };    
        
        }
        else if($scope.rideData.to == "Home"){
            ride.endLocation = currentUser.homeAddressLocation;
        }
        else if($scope.rideData.to == "Office"){
             ride.endLocation = currentUser.officeAddressLocation;
        }
        ride.initiallyAvailableSeats = $scope.rideData.availableSeats;
        ride.rideScheduledTime = moment().add(parseInt($scope.rideData.leavingIn),"minutes").valueOf();
        ride.vehicleLicenseNumber = currentUser.vehicle[0].vehicleLicenseNumber;
        ride.rideStatus = "ACTIVE";
        
        if(!$scope.routeSummary && routes.length > 1){
            if(config.cordova) cordovaUtil.showToastMessage("Please select a route before posting the ride!")
            else alert("Please select a route before posting the ride");
            return false;
        }

        ride.routeSummary = $scope.routeSummary;


        console.log("final obj",ride)
        httpRequest.post(config.apis.postRide,{'ride':ride}).
        then(function(data){
            console.log(data);
            if(data.status==201){
                if(config.cordova) cordovaUtil.showToastMessage("Ride posted succesfully!")
                else alert("Ride posted succesfully!");
                $state.go('userHome.rideStatus');
            }  
        },function(err){
            console.log("err",err);

             if(err.status == 409){
                  if(config.cordova) cordovaUtil.showToastMessage('You are already part of an Active Ride');
                  else alert('You are already part of an Active Ride');
                  $state.go('userHome.rideStatus');
            }
        })
    }
});
'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.postRides', {
        url: '/postRides',
        templateUrl: 'app/postRides/postRides.html',
        controller: 'PostRidesCtrl',
        authenticate:true
      });
  });

//Data Body
/*
additionalData: {
  collapse_key: "com.tcs.cb"
  e: "1"
  foreground: true
  icon: "ic_launcher"
  key2: "message2"
},
message: "You have an appointment in 1 hour"
title: "Commute buddy"
*/

'use strict';

angular.module('cbApp')
  .service('pushnotification', function ($q) {
    return {
      registerPushNotification : function(){
        var deferred= $q.defer();

        var androidConfig = {
             "senderID": "463291795017",
             "sound": "true",
             "icon":"logo",
             "iconColor":"blue",
             "vibrate": "true",
             "clearNotifications": "true"

            };

        var push = PushNotification.init({
          android: androidConfig,
          ios: {
            alert: "true",
            badge: true,
            sound: 'false'
          },
          windows: {}
        });

        push.on('registration', function(data) {
          console.log("Registration Event Callback");
          console.log("data.registrationId: ", data.registrationId);
          deferred.resolve(data.registrationId);
        });

        push.on('notification', function(data) {
            console.log("Notification Event Callback");
            console.log("Data from Notification Event Callback : ", JSON.stringify(data));
            push.finish(function() {
              alert('finish successfully called');
            });
            push.approve(function() {
                alert("Approve Got Called Successfully");
            });
            push.reject(function() {
                alert("Reject Got Called Successfully");
            });
        });

        push.on('error', function(e) {
          console.log("Error Event Callback");
          console.log("Error : ", e);
          alert("push error");
        });

        return deferred.promise;
      }

      /*window.approve = function(data){
        alert("Approve Triggered");
        console.log("Approve Callback Triggred. Here is the Data : ", data);
      }

      window.reject = function(data){
        alert("Reject Triggred");
        console.log("Reject Callback Triggred. Here is the Data : ", data);
      }*/
    }
});
'use strict';

angular.module('cbApp')
  .controller('RideDetailsCtrl', ['$scope','staticData','Auth','$state','$stateParams','httpRequest'
  	,function ($scope,staticData,Auth,$state,$stateParams,httpRequest) {
  	var forAction = $stateParams.for;
    $scope.autocompleteOptions = { componentRestrictions: { country: 'in' } }
    $scope.showAutoCompleteErrorMessage = false;
    if(forAction == "takeRide"){
        $scope.hideVehicleDetails = true;
        $scope.pageHeader = 'TAKE RIDE'
    }else{
        $scope.hideVehicleDetails = false;
        $scope.pageHeader = 'POST RIDE';
    }
  	console.log("forAction", forAction);
    $scope.message = 'Hello';
    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.timeSlotJSON =   [
    							{'start':'8:00 AM','end':'5:00 PM'},
    							{'start':'9:00 AM','end':'6:00 PM'},
    							{'start':'10:00 AM','end':'7:00 PM'},
    							{'start':'11:00 AM','end':'8:00 PM'},
    							{'start':'12:00 AM','end':'9:00 PM'}
                            ];
	Auth.getCurrentUser()
        .then(function(data){
            $scope.user = data;
            if(!$scope.user.vehicle){
                $scope.user.vehicle = [];
                var vehicle = {};
                $scope.user.vehicle.push(vehicle);
            }
            if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
            if($scope.user.officeAddressLocation) $scope.user.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
            if($scope.user.shiftTimeIn && $scope.user.shiftTimeout) $scope.user.timeSlot = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
         });

    $scope.saveDetails=function () {
    	console.log("$scope.user",$scope.user);
    	var obj = {};
    	obj.vehicle = $scope.user.vehicle;
    	
        if($scope.userProfileUpdateForm.shiftStartTime.$dirty){
            obj.shiftTimeIn = $scope.user.timeSlot.start;
            obj.shiftTimeout = $scope.user.timeSlot.end;
        }

        if($scope.userProfileUpdateForm.shiftEndTime.$dirty){
            obj.shiftTimeIn = $scope.user.timeSlot.start;
            obj.shiftTimeout = $scope.user.timeSlot.end;
        }

        if($scope.userProfileUpdateForm.officeAddress.$dirty) obj.officeAddressLocation = $scope.user.officeAddress;
        if($scope.userProfileUpdateForm.homeAddress.$dirty){

            if($scope.user.homeAddress.name && $scope.user.homeAddress.formatted_address && $scope.user.homeAddress.geometry){
                obj.homeAddressLocation = {};
                obj.homeAddressLocation.display_address = $scope.user.homeAddress.name;
                obj.homeAddressLocation.formatted_address = $scope.user.homeAddress.formatted_address;
                obj.homeAddressLocation.icon = $scope.user.homeAddress.icon;
                obj.homeAddressLocation.placeId = $scope.user.homeAddress.place_id;
                obj.homeAddressLocation.location = []
                obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lng());
                obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lat());

                for(var i=0, len = $scope.user.homeAddress.address_components.length; i < len; i++) {
                    var ac = $scope.user.homeAddress.address_components[i];
                    console.log(ac);
                    if(ac.types.indexOf("administrative_area_level_2") >= 0) obj.city = ac.long_name;
                    if(ac.types.indexOf("administrative_area_level_1") >= 0) obj.state = ac.long_name;
                    if(ac.types.indexOf("postal_code") >= 0) obj.zipcode = ac.long_name;
                }
                $scope.userProfileUpdateForm.homeAddress.$setValidity("useautocomplete", true);
            }else{
                $scope.userProfileUpdateForm.homeAddress.$setValidity("useautocomplete", false);
                return false;
            }
        }

    	var url = config.apis.signup + $scope.user._id;
    	httpRequest.put(url,obj)
    	.then(function (data) {
    		if(data.status === 200){
                if(config.cordova) cordovaUtil.showToastMessage("Your information has been stored successfully.");
    			else alert('Your information has been stored successfully.');
    			Auth.getCurrentUser(true)
    			.then(function(data){
        			$scope.user = data;
        			if(forAction == 'postRides') $state.go('userHome.postRides');
        			else if(forAction == 'takeRide') $state.go('userHome.availableRides');
    			});
    		}
    	})
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

  }]);


'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.rideDetails', {
        url: '/rideDetails',
        templateUrl: 'app/rideDetails/rideDetails.html',
        controller: 'RideDetailsCtrl',
        params:{'for':''}
      });

  });

'use strict';

angular.module('cbApp')
  .controller('RideStatusCtrl', function ($scope, Auth, httpRequest, $state, $timeout) {
    $scope.message = 'Hello';
    $scope.editableMode = false;
    $scope.leftButtonText = "RESCHEDULE RIDE";
    $scope.rightButtonText = "CANCEL RIDE";
    $scope.leavingInJSON =  [
                                {"text":"05 MIN","value":"5"},
                                {"text":"10 MIN","value":"10"},
                                {"text":"15 MIN","value":"15"},
                                {"text":"20 MIN","value":"20"},
                                {"text":"25 MIN","value":"25"},
                                {"text":"30 MIN","value":"30"},
                                {"text":"35 MIN","value":"35"},
                                {"text":"40 MIN","value":"40"},
                                {"text":"45 MIN","value":"45"},
                                {"text":"50 MIN","value":"50"},
                                {"text":"55 MIN","value":"55"},
                                {"text":"60 MIN","value":"60"},
                            ];

    httpRequest.get(config.apis.latestActiveRideOfUser)
        .then(function(data){
            $scope.postedRide = data.data;

            Auth.getCurrentUser()
                .then(function(data){
                    $scope.user = data;
                    if($scope.user.empId == $scope.postedRide.offeredBy.empId){
                        $scope.leftButtonText = "RESCHEDULE RIDE";
                    }else{
                        $scope.leftButtonText = "TRACK DRIVER";
                    }
                 });

            console.log("postedRide : ", $scope.postedRide);
            var now = moment();
            var to = moment($scope.postedRide.rideScheduledTime);
            $scope.rideScheduledTime = Math.abs( now.diff(to,'minutes') );

            //To create a ticking minutes Clock. Time in minutes will automatically decrement by 1 each minute
            $scope.onTimeout = function(){
                $scope.rideScheduledTime--;
                if($scope.rideScheduledTime > 0) mytimeout = $timeout($scope.onTimeout,60000);
                else{
                  alert("Time is up! Your ride will be deleted from our system.");
                  httpRequest.delete(config.apis.deleteRide + $scope.postedRide._id)
                             .then(function(response){
                                if(response.satatus == 204){
                                    if(config.cordova) cordovaUtil.showToastMessage("Your ride has been deleted.")
                                    else alert("Your ride has been deleted.");
                                    $state.go('userHome.home');
                                }
                             }, function(err){
                                  if(err){
                                      if(config.cordova) cordovaUtil.showToastMessage("Your ride couldn't be deleted at this point.")
                                      else alert("Your ride couldn't be deleted at this point.");
                                      $state.go('userHome.home');
                                  }
                             });
                }
            }
            var mytimeout = $timeout($scope.onTimeout,60000);
        },function(err){
            if(err.status == 409) alert('Error getting recent ride details');
            if(err.status == 404){
              alert('You are not a part of an active ride. Please post a ride or request a ride to see it\'s details here');
              $state.go('userHome.home');
            }
        });

    $scope.leftButtonClicked = function(buttonText){
      if(buttonText == "RESCHEDULE RIDE"){
        $scope.editableMode = true;
        $scope.leftButtonText = "CONFIRM RESCHEDULE";
        $scope.rightButtonText = "CANCEL";
      }
      else if(buttonText == "CONFIRM RESCHEDULE"){
        console.log("Leaving in : ", $scope.leavingIn);
        var postBody = {};
        postBody.newRideScheduledTime = moment().add(parseInt($scope.leavingIn),"minutes").valueOf();
        httpRequest.put(config.apis.rescheduleRide + $scope.postedRide._id, postBody)
                   .then(function(data){
                      console.log("Data after reschedule Ride : ", data);
                      if(data.status == 200){
                          alert("Ride rescheduled Successfully");
                          console.log("Config.data.newRideScheduledTime : ", data.config.data.newRideScheduledTime);
                          var now = moment();
                          var to = moment(data.config.data.newRideScheduledTime);
                          $scope.rideScheduledTime = Math.abs( now.diff(to,'minutes') );
                          $scope.editableMode = false;
                          $scope.leftButtonText = "RESCHEDULE RIDE";
                          $scope.rightButtonText = "CANCEL RIDE";
                      }
                   }, function(err){
                      alert("Ride can't be rescheduled at this point. Error : " + err);
                   });
      }
      else if(buttonText == "TRACK DRIVER"){
          if(config.cordova) cordovaUtil.showToastMessage('This feature is in progress');
          else alert('This feature is in progress');
      }
    };

    $scope.rightButtonClicked = function(buttonText){
      if(buttonText == "CANCEL"){
        $scope.leftButtonText = "RESCHEDULE RIDE";
        $scope.rightButtonText = "CANCEL RIDE";
        $scope.editableMode = false;
      }
      else if(buttonText == "CANCEL RIDE"){
        var r = confirm("Are you sure you want to cancel this ride?");
        if (r == true) {
            // TODO : Code to cancel the Ride
            //alert('User confirmed to cancel ride');
            httpRequest.put(config.apis.cancelRide + $scope.postedRide._id)
                       .then(function(data){
                          console.log("Data from cancel ride : ", data);
                          if(data.status == 200){
                            alert("Ride Cancelled Successfully");
                            $state.go('userHome.home');
                          }
                       }, function(err){
                          alert("Ride can't be cancelled at this point. Error : " + err);
                       });

        } else return;
      }
    };

    $scope.startRide = function(){
      $state.go('userHome.startSampling');
    }

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };
  });
'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.rideStatus', {
        url: '/rideStatus',
        templateUrl: 'app/rideStatus/rideStatus.html',
        controller: 'RideStatusCtrl'
      });
  });
'use strict';

angular.module('cbApp')
  .directive('scroll', function ($window) {
     return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 75) {
                 scope.boolChangeClass = true;
                // console.log('Scrolled below header.');
             } else {
                 scope.boolChangeClass = false;
                 //console.log('Header is in view.');
             }
            scope.$apply();
        });
    };
  });
'use strict';

angular.module('cbApp')
  .controller('StartSamplingCtrl', function (Auth,$scope, cordovaUtil,$rootScope,localStorage,filterService,httpRequest) {
    $scope.message = 'Hello';
    $scope.buttonText="START SAMPLING";
    $scope.mapEvents={};
    $scope.mapEvents.path= {
                        enable: [ 'click', 'mouseover' ]
                    };
        
    $scope.defaults={minZoom:10, maxZoom:20,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
    $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };
    $scope.$on('leafletDirectivePath.myMap.mousedown', function (event) {
                console.log('Path clicked ',event);
     });
    $scope.setCenter=true;
    $scope.paths={};
    $scope.startOrStopSampling = function(value){
    	if(value == "START SAMPLING"){
    		$scope.buttonText="STOP SAMPLING";
            if(config.cordova)
            cordova.plugins.backgroundMode.enable();
    		cordovaUtil.getCoordinates((new Date()).getTime());
    	}
    	else{
    		$scope.buttonText="START SAMPLING";
             if(config.cordova)
            cordova.plugins.backgroundMode.disable();
    		cordovaUtil.stopSampling();
    	}
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

    $rootScope.$on("locationCaptured",function(){
         localStorage.retrieve('SavedLocationCoordinates').then(function(locations){
                var storedlocations =JSON.parse(locations);
                if(storedlocations==null)
                    return;
               else{
                var pathArr=[];
                storedlocations.TrackedLocations.forEach(function(obj){
                        pathArr.push( { lat: obj.location.latitude, lng: obj.location.longitude })
                })
                if($scope.setCenter){
                    $scope.center=pathArr[0];
                    $scope.setCenter=false;
                }
               console.log(filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5))
                $scope.paths={
                     p1: {
                color: '#008000',
                weight: 8,
                latlngs:filterService.GDouglasPeucker(pathArr,20)
                }

               }
           }
            }) 
    });
/*    var currentUser = Auth.getCurrentUser();
    var getLocations = function(){
        var filterJSON = {};
        filterJSON.userId = currentUser.userId;

        httpRequest.post(config.apis.filterLocations,filterJSON).
        then(function(response) {
             console.log("locations",response);
            if(response.status==200 && response.data.length > 0){

                    var pathArr=[];

                    angular.forEach(response.data, function(location, key){
                        pathArr.push({lat:location.location.latitude,lng:location.location.longitude});

                    });
                    console.log("pathArr",pathArr)
                    if($scope.setCenter){
                            $scope.center=pathArr[0];
                            $scope.setCenter=false;
                    }
                     $scope.paths={
                             p1: {
                        color: '#008000',
                        weight: 8,
                        latlngs:filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5)
                        }

                       }
            console.log("filtered data",filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5));
            }
           

        })    
        
    }*/
   // getLocations();
/*    $scope.filterData=function(pathArr,threshold){
        var curr,prev;
        var resultArr=[];
        for(var i=0;i<pathArr.length;i++){
            curr=pathArr[i];
            if(prev){
            var p1={
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [curr.lng, curr.lat]
            }
            }
             var p2={
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [prev.lng, prev.lat]
            }
            }
            
            var distance = turf.distance(p1, p2);
            if(distance<threshold)
            {
                resultArr.push(curr);
            }
            }
            prev=curr;
        }
        return resultArr;
    }*/
  /*  $scope.GDouglasPeucker=function(source, kink)
 source[] Input coordinates in GLatLngs 	*/
/* kink	in metres, kinks above this depth kept  */
/* kink depth is the height of the triangle abc where a-b and b-c are two consecutive line segments 
{
    var	n_source, n_stack, n_dest, start, end, i, sig;    
    var dev_sqr, max_dev_sqr, band_sqr;
    var x12, y12, d12, x13, y13, d13, x23, y23, d23;
    var F = ((Math.PI / 180.0) * 0.5 );
    var index = new Array(); /* aray of indexes of source points to include in the reduced line 
	var sig_start = new Array(); /* indices of start & end of working section 
    var sig_end = new Array();	

    /* check for simple cases 

    if ( source.length < 3 ) 
        return(source);    /* one or two points 

    /* more complex case. initialize stack 
		
	n_source = source.length;
    band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0);	/* Now in degrees 
    band_sqr *= band_sqr;
    n_dest = 0;
    sig_start[0] = 0;
    sig_end[0] = n_source-1;
    n_stack = 1;

    /* while the stack is not empty  ... 
    while ( n_stack > 0 ){
    
        /* ... pop the top-most entries off the stacks 

        start = sig_start[n_stack-1];
        end = sig_end[n_stack-1];
        n_stack--;

        if ( (end - start) > 1 ){  /* any intermediate points ?        
                    
                /* ... yes, so find most deviant intermediate point to
                       either side of line joining start & end points                                   
            
            x12 = (source[end].lng - source[start].lng);
            y12 = (source[end].lat - source[start].lat);
            if (Math.abs(x12) > 180.0) 
                x12 = 360.0 - Math.abs(x12);
            x12 *= Math.cos(F * (source[end].lat + source[start].lat));/* use avg lat to reduce lng 
            d12 = (x12*x12) + (y12*y12);

            for ( i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++ ){                                    

                x13 = (source[i].lng - source[start].lng);
                y13 = (source[i].lat - source[start].lat);
                if (Math.abs(x13) > 180.0) 
                    x13 = 360.0 - Math.abs(x13);
                x13 *= Math.cos (F * (source[i].lat + source[start].lat));
                d13 = (x13*x13) + (y13*y13);

                x23 = (source[i].lng - source[end].lng);
                y23 = (source[i].lat - source[end].lat);
                if (Math.abs(x23) > 180.0) 
                    x23 = 360.0 - Math.abs(x23);
                x23 *= Math.cos(F * (source[i].lat + source[end].lat));
                d23 = (x23*x23) + (y23*y23);
                                
                if ( d13 >= ( d12 + d23 ) )
                    dev_sqr = d23;
                else if ( d23 >= ( d12 + d13 ) )
                    dev_sqr = d13;
                else
                    dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12;// solve triangle

                if ( dev_sqr > max_dev_sqr  ){
                    sig = i;
                    max_dev_sqr = dev_sqr;
                }
            }

            if ( max_dev_sqr < band_sqr ){   /* is there a sig. intermediate point ? */
                /* ... no, so transfer current start point 
                index[n_dest] = start;
                n_dest++;
            }
            else{
                /* ... yes, so push two sub-sections on stack for further processing 
                n_stack++;
                sig_start[n_stack-1] = sig;
                sig_end[n_stack-1] = end;
                n_stack++;
                sig_start[n_stack-1] = start;
                sig_end[n_stack-1] = sig;
            }
        }
        else{
                /* ... no intermediate points, so transfer current start point 
                index[n_dest] = start;
                n_dest++;
        }
    }

    /* transfer last point 
    index[n_dest] = n_source-1;
    n_dest++;

    /* make return array 
    var r = new Array();
    for(var i=0; i < n_dest; i++)
        r.push(source[index[i]]);
    return r;
    
}*/
});
'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.startSampling', {
        url: '/startSampling',
        templateUrl: 'app/startSampling/startSampling.html',
        controller: 'StartSamplingCtrl',
        authenticate:true
      });
  });
'use strict';

angular.module('cbApp')
  .service('staticData', function (httpRequest) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    return{
    	getTCSLocations:function(){
        var tcsLocations = [
	{
		"display_address":"TCS Sahyadri Park",
		"formatted_address": "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [73.6829262, 18.5806206],
	    "placeId": "ChIJz2_Fp2XAwjsRf-D83a7sne8"
    },

	{
		"display_address":"TCS Bhosari",
		"formatted_address": "TCS, Bhosari, Telco Rd, Landewadi, Pimpri, Pimpri-Chinchwad, Maharashtra 411026, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [73.838017, 18.6229641],
	    "placeId": "ChIJkx5xWX64wjsRw2ETFkK2fKk"
	},

	{
		"display_address":"TCS Quadra II",
		"formatted_address": "TATA Consultancy Services, S.No. 238/239, Quadra II, Opp Magarpatta City, Hadapsar, Pune, Maharashtra 411028, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.933573, 18.5132302],
	    "placeId": "ChIJjwkMLvXBwjsR_KclVTRIC7M"
	},

	{
		"display_address":"Tata Research Developement and Design Center(TRDDC)",
		"formatted_address": "TRDDC, Hadapsar, Pune, Maharashtra 411013, India",
		"display_address" : "Tata Research Developement and Design Center",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
	    "location": [73.9166811, 18.511536],
	    "placeId": "ChIJVVVVVeXBwjsRjhAlp31GD18"
	},

	{
		"display_address":"VSNL Training Centre- Pune",
		"formatted_address": "VSNL Training Centre, Dighi, Pune, Maharashtra 411015, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.8659042, 18.6053331],
	    "placeId": "ChIJ0zPIrRTHwjsRmAZZGDn6HY0"
	},

	{
		"display_address":"The Quadron Business Park",
		"formatted_address": "The Quadron Business Park, Plot No. 28 Rajiv Gandhi Infotech Park, Phase II, Hinjewadi, Pune, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.6970379, 18.5859733],
	    "placeId": "ChIJ6ykEDQu7wjsRVDBjuDKHtnI"
	},

	{
		"display_address":"CommerZone",
		"formatted_address": "Commerzone IT Park, Yerawada, Pune, Maharashtra 411006, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [73.883805, 18.5602898],
	    "placeId": "ChIJH7PcT9nAwjsRFK4IL60gRjI"
	},

	{
		"display_address":"TCS, Nyati Tiara",
		"formatted_address": "Tata Consultancy Services, Pune Nagar Rd, Blue Hill Society, Yerawada, Pune, Maharashtra 411006, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.890797499, 18.5475484],
	    "placeId": "ChIJC1YZpB3BwjsR8nFN2b93NgM"
	},

	{
		"display_address":"Cerebrum IT Park" ,
		"formatted_address": "Cerebrum IT Park, Marigold complex, Kalyani Nagar, Pune, Maharashtra 411014, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [73.9105654, 18.5445986],
	    "placeId": "ChIJG2xMEw3BwjsR5pww7XHk63U"
	},

	{
		"display_address":"CMC LIMITED" ,
		"formatted_address": "CMC-Pune, Elbee House, Dhole Patil Road, Siddharth Path, Pune, Maharashtra 411001, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
	    "location": [73.8762283, 18.534962],
	    "placeId": "ChIJ47XjtPnAwjsRfl0REV-KQdY"
	},

	{
		"display_address":"Birla AT And T Communications . Ltd",
		"formatted_address": "Koregaon Park Rd, Bund Garden, Sangamvadi, Pune, Maharashtra 411001, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
	    "location": [73.8850588, 18.54092559999999],
	    "placeId": "ChIJkap8WPzAwjsRhdgLCXcF0to"
	},

	{
		"display_address":"Mahindra British Telecom Limited",
		"formatted_address": "S. No. 91, CTS No. 11/B/1, 2nd and 3rd Floor, Sharda Center, Erandwane, Pune, Maharashtra 411004, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.835775, 18.510174],
	    "placeId": "ChIJZVBZBoy_wjsRVkx2MdDgx9Y"
	},

	{
		"display_address":"TCS PUNE (Millenium)" ,
		"formatted_address": "TCS PUNE (Millenium), Godrej Millenium, Lane Number 7, Vasani Nagar, Koregaon Park, Pune, Maharashtra 411001, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.897226, 18.537914],
	    "placeId": "ChIJfZBSjAbBwjsRNADABRxQrJo"
	},

	{
		"display_address":"NAVLAKHA COMP.-PUNE" ,
		"formatted_address": "NAVLAKHA COMP, Bibwewadi Kondhwa Road, Near Jhala Complex, Bibwewadi Kondhwa Road, Pune, Maharashtra 411037, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [73.8754836, 18.4814269],
	    "placeId": "ChIJD00TwpzqwjsRzjNkTr9FcIU"
	},

	/*{
		"display_address":"Pune-Sun Suzlon-NSTP" ,
		"formatted_address": "Pune-Sun Suzlon, 180/1-8, Opposite Magarpatta City,, Hadapsar, Pune, Maharashtra 411028, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5121034, 73.9352588],
	    "placeId": "ChIJqVjgZ_XBwjsR4b3VqX-poDE"
	},

	{"displayAddress":"Pune PSK Sites" ,
		"formatted_address": "Passport Seva Kendra, A1, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5309037, 73.9135919],
	    "placeId": "ChIJrXdkmJ_BwjsRG2vuqY9LP7w"
	},

	{
		"display_address":"Nashik PSK Sites" ,
		"formatted_address": "Nashik Passport Office - Passport Seva Kendra, Shop No 3&4, Ground Floor, Nashik Pune National Highway, Nashik, Maharashtra 422214, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/civic_building-71.png",
	    "location": [19.9606742, 73.8285404],
	    "placeId": "ChIJEybtlLLq3TsRWe7D4A8HWn4"
	},

	*/

];
    		return tcsLocations;
    	}
    }
  });

'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', function ($scope, leafletMarkerEvents, $timeout,httpRequest,Auth, $stateParams) {
    $scope.team = $stateParams.team;
    $scope.membersEmpIds = [];
     
     Auth.getCurrentUser()
         .then(function(data){
            $scope.currentUser = data;

            $scope.center.lat = $scope.currentUser.homeAddressLocation.location[1];
            $scope.center.lng = $scope.currentUser.homeAddressLocation.location[0];

            getAllSuggestions();
         });

   $scope.defaults={minZoom:10, maxZoom:15,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
     $scope.markers= [];
    var getAllSuggestions = function(){

        console.log("The current team Object is : ", $stateParams.team);

        httpRequest.get(config.apis.getAllUsers).
        then(function(res){
            console.log("res",res);
            if(res.status==200){
                $scope.suggestedUsers = res.data;

                angular.forEach($scope.suggestedUsers, function(user, key){
                        var tempObj = {};
                        tempObj.lat = parseFloat(user.homeAddressLocation.location[1]);
                        tempObj.lng = parseFloat(user.homeAddressLocation.location[0]);
                        tempObj.enable=['click','touch'];
                        var markerClass ="";
                        if($scope.currentUser.empId == user.empId)
                            markerClass = "map-user-marker user-own";
                        else
                             markerClass = "map-user-marker";
                        var image = angular.element('<img>',{src:user.userPhotoUrl || "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png" ,'class':markerClass});
                        var p = angular.element('<p>',{'class':'map-user-name-sec','html':user.empName});



                        console.log(image.outerHTML )
                        /*tempObj.layer="Options";*/
                        tempObj.icon = {
                                            type: 'div',
                                            iconSize: [25, 60],
                                            popupAnchor: [0, -50],
                                            iconAnchor: [10, 45],
                                            html: image[0].outerHTML + p[0].outerHTML
                                        }
                        tempObj.message='<user-marker contactno="'+user.contactNo+'" empid="'+user.empId+'" action="addAsMember('+user.empId+')"></user-marker>';
                        $scope.markers.push(tempObj);
                });
                console.log($scope.markers)
            }
        })
    }    

    
    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }
   
    $scope.center = {
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 30
    };

     var eventNameClick = 'leafletDirectiveMarker.myMap.click';
     var eventNameTouch = 'leafletDirectiveMarker.myMap.touch';
        $scope.$on(eventNameClick, function(event, args){
            
        $timeout(function(){
            var  wrapper = document.getElementById('cn-wrapper');
            classie.add(wrapper, 'opened-nav');
        },100)
         

        });
        $scope.$on(eventNameTouch, function(event, args){
            

          $timeout(function(){
            var  wrapper = document.getElementById('cn-wrapper');
         classie.add(wrapper, 'opened-nav');
        },100)
         

        });
    /*{
            osloMarker: {
                lat: 59.91,
                lng: 10.75,
                message: "I want to travel here!",
                focus: true,
                draggable: false
            }
        }*/

    $scope.addAsMember = function(empId){
        console.log("In Add Member with empId : ", empId);
        console.log("membersEmpIds before push : ", $scope.membersEmpIds);
        $scope.membersEmpIds.push(empId);
        console.log("membersEmpIds after push : ", $scope.membersEmpIds);
    };

    $scope.createTeam = function(){
        console.log("$scope.team from createTeam method in Suggestions : ", $scope.team);
        var teamObject = {};
        teamObject.createdByEmpId = $scope.membersEmpIds;
        teamObject.team = $scope.team;

        console.log("Final Team Object before TeamCreation : ", teamObject);

        httpRequest.post(config.apis.createTeam, teamObject)
                   .then(function(data){
                        console.log("Team Created Successfully. TEAM: ", data.data);
                        if(config.cordova) cordovaUtil.showToastMessage('A request has been sent for the members to join your team.');
                        else alert('A request has been sent for the members to join your team.');
                 }).error(function(data, status, headers, config){
                    console.log("Error creating a Team");
                 });
    };
    
  });
'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.suggestions', {
        /*url: '/suggestions',*/
        templateUrl: 'app/suggestions/suggestions.html',
        controller: 'SuggestionsCtrl',
        params: {'team': null},
        authenticate:true
      });
  });
'use strict';

angular.module('cbApp')
  .controller('TeamDetailsCtrl', function ($scope, $state, httpRequest, $stateParams) {
    $scope.message = 'Hello';
    
    var getTeamDetails = function(){
    	console.log("Team_id in getTeamDetails : ", $stateParams.teamId);
    	var apis = config.apis.getTeamDetails;
  		$scope.teams = [];
  		httpRequest.get(apis + $stateParams.teamId).
  		then(function(team){
  			if(team.status == 200){
      		$scope.team = team.data;
      		console.log("Team Details in getTeamDetails", $scope.team);
  			}
  			else if(teams.status == 404){
  				alert("It's lonely in here. Please create a team to see it here");
  				$state.go('userHome/home');
  			}
  		});
    }
    
    if($stateParams.team) $scope.team = $stateParams.team;
    else getTeamDetails();

    $scope.getTeamActivities = function(){
      $state.go("activities", {'team': $scope.team});
    };

    $scope.toggleFooter = function(){
        $(".home-page-menu-options").slideToggle(250);
    }
  });
'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teamDetails', {
      	templateUrl: 'app/teamDetails/teamDetails.html',
      	params: {'teamId': null, 'team': null},
      	controller: 'TeamDetailsCtrl'
      });
});
'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', function ($scope,Auth,$state,User) {
    $scope.message = 'Hello';
    $scope.tgState = false;
    Auth.getCurrentUser().then(function(data){return $scope.currentUser = data});
    
    
    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    };

    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    };

    $scope.logout = function(){
    	Auth.logout();
      $state.go("login")
    }
  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome', {
        url: '/userHome',
        templateUrl: 'app/userHome/userHome.html',
        controller: 'UserHomeCtrl',
        authenticate:true
      });
  });
'use strict';

angular.module('cbApp')
  .directive('userMarker', function () {
    return {
      templateUrl: 'app/userMarker/userMarker.html',
      restrict: 'E',
      scope:{  //This represents an isolated scope. In this case this isolated scope will not be able to access the parent scope
      	contactno:"@", //@ will take the value of contactno AS STRING from it's consumer but won't update it if it's changed in the directive
        empid:"@",  //= provides a two way data binding. i.e. it will not only take the empid value of it's consumer but will also update it if it's changed here
        action:"&"  //& is used for methods
      },
      link: function (scope, element, attrs) {
          scope.onClick = function() {
            // Ad "id" to the locals of "editWebsite" 
            scope.action(scope.empid);
          }
      }
  }});
'use strict';

angular.module('cbApp')
  .controller('UserProfileCtrl', function ($scope, $state, Auth, $modal, cordovaUtil, $cordovaImagePicker, httpRequest, staticData) {
    $scope.message = 'Hello';
    $scope.editableMode = false;


    $scope.autocompleteOptions = { componentRestrictions: { country: 'in' } }

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function isEmpty(obj) {

        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    };

    $scope.officeAddressJSON = staticData.getTCSLocations();

    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
   
    $scope.timeSlotJSON = [
                            {'start':'8:00 AM','end':'5:00 PM'},
                            {'start':'9:00 AM','end':'6:00 PM'},
                            {'start':'10:00 AM','end':'7:00 PM'},
                            {'start':'11:00 AM','end':'8:00 PM'},
                            {'start':'12:00 AM','end':'9:00 PM'}
                          ];

    Auth.getCurrentUser()
        .then(function(data){
            $scope.user = data;
            console.log("$scope.user from top block : ", $scope.user);
            if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
            if($scope.user.officeAddressLocation) $scope.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
            if($scope.user.vehicle[0]) $scope.vehicleCapacity = _.findWhere( $scope.vehicleCapacityJSON, $scope.user.vehicle[0].capacity );
            if($scope.user.shiftTimeIn) $scope.shiftTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
        });

    $scope.leftButtonText = "EDIT";
    $scope.rightButtonText = "LOGOUT";

    $scope.$watch('user.contactNo', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.contactNo = newValue;
    });

    $scope.$watch('user.homeAddress', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.homeAddress = newValue;
    });

    $scope.$watch('officeAddress', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.officeAddress = newValue;
    });

    $scope.$watch('user.vehicle[0].vehicleLicenseNumber', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.vehicle[0].vehicleLicenseNumber = newValue;
    });

    $scope.$watch('vehicleCapacity', function(newValue, oldValue, scope) {
      if( newValue != oldValue ) $scope.user.vehicle[0].capacity = newValue;
    });

    $scope.$watch('shiftTime', function(newValue, oldValue, scope) {
      if( newValue != oldValue ){
        $scope.user.shiftTimeIn = newValue.start;
        $scope.user.shiftTimeout = newValue.end;
      }
    });

    $scope.operation = function(buttonText){
      if(buttonText == "EDIT"){
        $scope.leftButtonText = "UPDATE";
        $scope.rightButtonText = "CANCEL";
        $scope.editableMode = true;
      }
      else if(buttonText == "LOGOUT"){
        Auth.logout();
        $state.go("login");
      }
      else if(buttonText == "UPDATE"){
        $scope.saveDetails();
        //$scope.editableMode = false;
        /*if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";*/
      }
      else if(buttonText == "CANCEL"){
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";
        $scope.editableMode = false;
      }
    };

    /*$scope.getLocation=function(){
          var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'components/modal/modal.html',
            controller: 'ModalCtrl',
            size: 'sm'
          });
        
        modalInstance.result.then(function(option){
          if(option == "yes")
          cordovaUtil.getUserHomeCoordinates().then(function(address){
          	alert('Promise was returned successfully. Address is : ' + address);
           	$scope.user.homeAddress = address.homeAddress;
            $scope.user.city = address.city;
            $scope.user.zipcode = address.zipcode;
            $scope.user.placeID = address.placeID;
          })
        });
    };*/
    
    $scope.toggleFooter = function(){
      $(".home-page-menu-options").slideToggle(250);
    }

  $scope.getImageSaveContact = function() {       
      // Image picker will load images according to these settings
      console.log("Image Picker will open in phone");
      var options = {
          maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
          width: 800,
          height: 800,
          quality: 80            // Higher is better
      };

      if($cordovaImagePicker){
          $cordovaImagePicker.getPictures(options).then(function (results) {
              // Loop through acquired images
              for (var i = 0; i < results.length; i++) {
                  $scope.selectedImage = results[i];   // We loading only one image so we can use it like this

                  window.plugins.Base64.encodeFile($scope.selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                      $scope.selectedImage = base64;
                      console.log($scope.selectedImage);
                      $scope.saveImage();
                  });
              }
          }, function(error) {
              console.log('Error: ' + JSON.stringify(error));    // In case of error
          });
      }
  };

  $scope.saveImage = function(){
      var obj = {};
      obj.userPhotoUrl = $scope.selectedImage;
      var url = config.apis.signup + $scope.user._id;
      httpRequest.put(url,obj)
      .then(function (data) {
        if(data.status === 200){
          if(config.cordova) cordovaUtil.showToastMessage('Profile Image Updated Successfully');
          else alert('Profile Image Updated Successfully');
          Auth.getCurrentUser(true)
          .then(function(data){
              console.log("Data returned : ", data);
              $scope.user = data;
              console.log("$scope.user", $scope.user);
              $scope.user.homeAddress = $scope.user.homeAddressLocation;
              $scope.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
              $scope.shiftTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );
              $scope.leftButtonText = "EDIT";
              $scope.rightButtonText = "LOGOUT";
              $state.go('userHome.userProfile');
          });
        }
      });
  };

  $scope.saveDetails=function () {
      var obj = {};
      
      if($scope.userProfileUpdateForm.contactNo.$dirty) obj.contactNo = $scope.user.contactNo;
      if($scope.userProfileUpdateForm.shiftStartTime.$dirty){
        obj.shiftTimeIn = $scope.user.shiftTimeIn;
      }
      if($scope.userProfileUpdateForm.shiftEndTime.$dirty){
        obj.shiftTimeout = $scope.user.shiftTimeout;
      }

      if($scope.userProfileUpdateForm.homeAddress.$dirty){
        if($scope.user.homeAddress.name && $scope.user.homeAddress.formatted_address && $scope.user.homeAddress.geometry && $scope.user.homeAddress.address_components){
          obj.homeAddressLocation = {};
          obj.homeAddressLocation.display_address = $scope.user.homeAddress.name;
          obj.homeAddressLocation.formatted_address = $scope.user.homeAddress.formatted_address;
          obj.homeAddressLocation.icon = $scope.user.homeAddress.icon;
          obj.homeAddressLocation.placeId = $scope.user.homeAddress.place_id;
          obj.homeAddressLocation.location = [];
          obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lng());
          obj.homeAddressLocation.location.push($scope.user.homeAddress.geometry.location.lat());
          for(var i=0, len = $scope.user.homeAddress.address_components.length; i < len; i++) {
              var ac = $scope.user.homeAddress.address_components[i];
              console.log(ac);
              if(ac.types.indexOf("administrative_area_level_2") >= 0) obj.city = ac.long_name;
              if(ac.types.indexOf("administrative_area_level_1") >= 0) obj.state = ac.long_name;
              if(ac.types.indexOf("postal_code") >= 0) obj.zipcode = ac.long_name;
          }
          $scope.userProfileUpdateForm.homeAddress.$setValidity("useautocomplete", true);
        }else{
          $scope.userProfileUpdateForm.homeAddress.$setValidity("useautocomplete", false);
          return false;
        }

      }

      if($scope.userProfileUpdateForm.officeAddress.$dirty) obj.officeAddressLocation = $scope.officeAddress;


      if($scope.userProfileUpdateForm.vehicleNo.$dirty || $scope.userProfileUpdateForm.availableSeats.$dirty){
        obj.vehicle = [];
        var vehicle = {};
        vehicle.vehicleLicenseNumber = $scope.user.vehicle[0].vehicleLicenseNumber;
        vehicle.capacity = $scope.user.vehicle[0].capacity;
        obj.vehicle.push(vehicle);
      }

      console.log("Final Updated User Object : ", obj);

      if(isEmpty(obj)){
        alert("Nothing to save");
        $scope.leftButtonText = "EDIT";
        $scope.rightButtonText = "LOGOUT";
        $scope.editableMode = false;
      }
      else{
        var url = config.apis.signup + $scope.user._id;
        httpRequest.put(url,obj)
        .then(function (data) {
          if(data.status === 200){
            if(config.cordova) cordovaUtil.showToastMessage('Profile Updated Successfully');
            else alert('Profile Updated Successfully');
            Auth.getCurrentUser(true)
            .then(function(data){
                console.log("Data returned : ", data);

                $scope.user = data;
                console.log("$scope.user", $scope.user);

                if($scope.user.homeAddressLocation) $scope.user.homeAddress = $scope.user.homeAddressLocation;
                if($scope.user.officeAddressLocation) $scope.officeAddress = _.findWhere( $scope.officeAddressJSON, { 'display_address': $scope.user.officeAddressLocation.display_address } );
                if($scope.user.vehicle[0]) $scope.vehicleCapacity = _.findWhere( $scope.vehicleCapacityJSON, $scope.user.vehicle[0].capacity );
                if($scope.user.shiftTimeIn) $scope.shiftTime = _.findWhere( $scope.timeSlotJSON, { 'start': $scope.user.shiftTimeIn } );

                $scope.leftButtonText = "EDIT";
                $scope.rightButtonText = "LOGOUT";
                
                $state.go('userHome.userProfile');
            });
          }
        });
      }
  };




  });

'use strict';

angular.module('cbApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userHome.userProfile', {
        url: '/userProfile',
        templateUrl: 'app/userProfile/userProfile.html',
        controller: 'UserProfileCtrl',
         authenticate:true
      });
  });
'use strict';

angular.module('cbApp')
  .factory('Auth', function Auth($location, $rootScope, User,$q,httpRequest,localStorage) {
    var currentUser = {};

   // if($cookieStore.get('token')) {
   //    currentUser = User.get();
   //  }
  var fetchUserFromLocalStorage=function(){
    var deffered= $q.defer();
    localStorage.retrieve('currentUser').
    then(function(obj){
      if(obj)
        deffered.resolve(obj);
      else
        deffered.reject(obj);
    },function(err){
      deffered.reject(obj);
    });
    return deffered.promise;
  };

  var fetchUserFromDB=function(){
      var deffered= $q.defer();
      localStorage.retrieve('token').
        then(function(res){
        if(res!=null){
           //currentUser = User.get();
           User.get().$promise.
           then(function(data){
              deffered.resolve(data);
           },
            function(error){
              deffered.reject(error);
            });
        } 
        else{
          //if token is null.
          console.log("no token found exiting.");
          deffered.reject("No auth token");
        }
      },
      function(err){
        //if error while retriving token.
        deffered.reject(err);
      });
      return deffered.promise;
  }; 

  var fetchUser=function(forceFetchfromDB){
    //forceFetchfromDB iof true then forced to fetch from DB;
    var deffered= $q.defer();
    if(forceFetchfromDB){
        fetchUserFromDB().
        then(function(user){
          currentUser=user;
          deffered.resolve(user);
          localStorage.store('currentUser',user);
          },function(err){
            deffered.reject();
        })
    }
    else{
      if(currentUser.userId){
        deffered.resolve(currentUser);
      }
      else{
      //not in cahe then check local
        fetchUserFromLocalStorage().
        then(function(user){
          currentUser=user;
          deffered.resolve(currentUser);
        },
        function(err){
          //not in local go to DB
          fetchUserFromDB().
          then(function(user){
            currentUser=user;
            deffered.resolve(user);
            //TODO: store in local
            localStorage.store('currentUser',user);
          },function(err){
            deffered.reject();
          })
        });
      }
    }
    //if in cache

    
    return deffered.promise;       
  }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var tempUser = {};
        tempUser.empId = user.empId;
        tempUser.password = user.password;
        httpRequest.post(config.apis.login,tempUser).
        then(function(data){
          if(data.status==200){
            //console.log("data.data",data.data)
             /*$localForage.setItem('token', data.data.token).*/
            localStorage.store('token',data.data.token).            
            then(function(){
              currentUser = User.get();
              console.log("currentUser in login service",currentUser)
              //fetch user & store in cache & local storage
              fetchUser(true).then(function(userData){
                  deferred.resolve(data);
                  return cb();
              });         
            });          
          }
        },function(err){
           this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));
        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        console.log(localStorage.retrieve('token'))
        localStorage.remove('token');
        localStorage.remove('currentUser');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            localStorage.store('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function(forceFetchfromDB) {
        // forceFetchfromDB if true forced to fetch from DB;
        var deffered=$q.defer();        
        fetchUser(forceFetchfromDB).then(function(user){
          //console.log("USer from getCurrentUser : ", user);
          deffered.resolve(user);
        },
          function(err){
            deffered.reject(err);
          }
        );
        return deffered.promise;
      },

      setCurrentUser:function(user){
        currentUser = user;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
      localStorage.retrieve('token').then(function(res){
          console.log(res);
          //console.log("token",token)
          if(res==null)
            return false;

        return true;
       });
        
        //return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        //changed 
        fetchUser().then(function(user){
          if(user.hasOwnProperty('empId'))
            cb(true);
          else
            cb(false);
        },function(err){
          cb(false)
        });
        // if(currentUser.hasOwnProperty('$promise')) {
        //   currentUser.$promise.then(function() {
        //     cb(true);
        //   }).catch(function() {
        //     cb(false);
        //   });
        // } else if(currentUser.hasOwnProperty('role')) {
        //   cb(true);
        // } else {
        //   cb(false);
        // }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return localStorage.retrieve('token');
      }
    };
  });

'use strict';

angular.module('cbApp')
  .factory('User', function ($resource) {
    var api = config.apiBaseURL;
    return $resource(api+'api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });

'use strict';

angular.module('cbApp')
  .controller('ModalCtrl', function ($scope, $modalInstance) {
    $scope.message = 'Hello';

    $scope.homeAddressModalOk = function(){
 
    //	cordovaUtil.getUserHomeCoordinates();
    	$modalInstance.close('yes');
    };

    $scope.homeAddressModalCancel = function(){
    	
    	$modalInstance.close();
    };


  });
'use strict';

angular.module('cbApp')
  .factory('Modal', function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        }
      }
    };
  });

'use strict';

/**
 * Removes server error when user updates input
 */
angular.module('cbApp')
  .directive('mongooseError', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('mongoose', true);
        });
      }
    };
  });
'use strict';

angular.module('cbApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
/* global io */
'use strict';

angular.module('cbApp')
  .factory('socket', function(socketFactory) {

    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io.connect(config.apiBaseURL, {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
       path: '/socket.io-client'
    });

    /*var ioSocket = io.connect(config.apiBaseURL+'socket.io-client')*/
    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;
        console.log("synch update called");
        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
         /* if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }*/

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      //unsyncUpdates: function () {} 
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }
    };
  });

angular.module('cbApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/account/login/login.html',
    "<!-- Login by Siddharth Ajmera --><div class=\"page-wrapper login-wrapper\"><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Login</span></div><div class=\"container login-container\"><div class=\"form-section login-form\"><div class=triangle-down-left-post></div><div class=login-form-wrapper><p class=\"error-msg for-wrong\">{{errorMsg}}</p><form class=form name=loginForm novalidate><div class=\"each-row login-page\"><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_employee_ID.png></span></div><div id=inputUserWrapepr class=user-input-section><!-- <label for=\"#username\" class=\"moving-label\" ng-click=\"moveLabelUp('inputUserWrapepr')\">Employee Id</label> --><input tabindex=1 id=username ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\" type=number name=empId placeholder=\"Employee Id\" ng-model=user.empId required ng-pattern=\"/^[0-9]*$/\" autofocus><!-- ng-click=\"moveLabelUp('inputUserWrapepr')\"\n" +
    "                ng-blur=\"moveLabelDown('inputUserWrapepr','username')\" ng-focus=\"moveLabelUp('inputUserWrapepr')\" --><div ng-show=showErrorMessage ng-messages=loginForm.empId.$error class=login-err-wrap><p ng-message=required class=error-msg>Please enter Employee ID</p><p ng-message=pattern class=error-msg>Please enter valid Employee ID</p></div></div></div><div class=\"each-row login-page\"><div class=field-icon-section><span><img class=\"icon-style key\" src=assets/images/password.gif></span></div><div id=inputPwdWrapper class=user-input-section><!-- <label for=\"#password\" class=\"moving-label\"  ng-click=\"moveLabelUp('inputPwdWrapper')\">Password</label> --><input tabindex=2 ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control pwd-boxes login-input-box\" id=password type=password name=password placeholder=Password ng-model=user.password required><!-- ng-click=\"moveLabelUp('inputPwdWrapper')\" ng-focus=\"moveLabelUp('inputPwdWrapper')\" ng-blur=\"moveLabelDown('inputPwdWrapper','password')\" --><div ng-show=showErrorMessage ng-messages=loginForm.password.$error class=login-err-wrap><p ng-message=required class=error-msg>Please enter Password</p></div></div></div><div tabindex=3 class=\"each-row login-page login-btn-sec\" ng-click=login()><span class=login-text>LOGIN</span> <img src=assets/images/icon_car.png class=login-car-img></div></form></div><!-- <a >Forgot Password?</a>\n" +
    "        <a ui-sref=\"signup.stepOne\">Register</a> --></div><a class=forgot-link ui-sref=settings>Forgot Password?</a> <a class=\"forgot-link new-here\" ui-sref=signup>New Here?</a></div></div>"
  );


  $templateCache.put('app/account/settings/settings.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show=\"(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)\">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class=\"btn btn-lg btn-primary\" type=submit>Save changes</button></form></div></div></div>"
  );


  $templateCache.put('app/account/signup/signup.html',
    "<div class=page-wrapper><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Sign Up</span></div><div class=\"container login-container\"><form name=signupForm class=animation-form-signup ng-submit=register() novalidate><div><div class=\"form-section signup-section-form\"><div class=triangle-down-left-post></div><div class=signup-sec-wrapper><div class=each-row><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_username.png></span></div><div class=user-input-section><input ng-class=\"{'error-border':!showErrorMessage}\" name=empName class=\"form-control input-boxes login-input-box\" ng-model=user.empName placeholder=Name required><div ng-show=!showErrorMessage ng-messages=signupForm.empName.$error class=error-msg-edit><p ng-message=required class=error-msg>Name is required</p><p ng-message=pattern class=error-msg>Invalid Name</p></div></div></div><div class=each-row><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_employee_ID.png></span></div><div class=user-input-section><input type=number max=9999999 ng-class=\"{'error-border':!showErrorMessage}\" class=\"form-control input-boxes login-input-box\" ng-model=user.empId name=empid placeholder=\"Employee Id\" required ng-pattern=\"/^[1-9]\\d*$/\"><div ng-show=!showErrorMessage ng-messages=signupForm.empid.$error class=error-msg-edit><p ng-message=required class=error-msg>Employee ID is required</p><p ng-message=pattern class=error-msg>Invalid Employee ID</p><p class=error-msg>{{error.data.errors.empId.message}}</p></div></div></div><div class=each-row><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_mobile_number.png></span></div><div class=user-input-section><input maxlength=10 class=\"form-control input-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" ng-model=user.contactNo type=tel name=contactNo required ng-pattern=\"/^[789]\\d{9}$/\" placeholder=\"Mobile Number\"><div ng-show=!showErrorMessage ng-messages=signupForm.contactNo.$error class=error-msg-edit><p ng-message=required class=error-msg>Contact Number is required</p><p ng-message=pattern class=error-msg>Invalid Contact Number</p><p class=error-msg>{{error.data.errors.contactNo.message}}</p></div></div></div><div class=each-row><div class=field-icon-section><span><img class=\"icon-style key\" src=assets/images/password.gif></span></div><div class=\"user-input-section show-pwd-wrap\"><input class=\"form-control pwd-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" required type={{fieldtype}} ng-model=user.password name=password placeholder=Password> <img src=assets/images/show_password.png alt=show class=show-pwd-icon ng-click=changeFieldType() ng-if=\"fieldtype=='password'\"> <img src=assets/images/hide_Password.png alt=show class=show-pwd-icon ng-click=changeFieldType() ng-if=\"fieldtype=='text'\"><div ng-show=!showErrorMessage ng-messages=signupForm.password.$error class=error-msg-edit><p ng-message=required class=error-msg>Please enter password</p></div></div></div><div id=sites class=\"each-row gender-section\"><img src=assets/images/gender.png class=\"gender-icon pull-left\"><div class=\"radio gender-radio\"><label class=rad><input type=radio name=optradio value=Female ng-model=\"user.gender\"><i></i> Female</label></div><div class=\"radio gender-radio\"><label class=rad><input type=radio name=optradio value=Male ng-model=\"user.gender\"><i></i> Male</label></div></div><div class=\"each-row login-page login-btn-sec\" ng-click=register()><span class=login-text>SIGN UP!</span> <img src=assets/images/icon_car.png class=login-car-img></div></div><p class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none terms-condn-section\">Already a member of the <b>Commute</b>Buddy Community? <span class=link-text ui-sref=login>Login</span></p><p class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none terms-condn-section\">By signing up, I agree to <span class=link-text>TCS's Terms of Service</span> and <span class=link-text>Privacy Policy</span>.</p></div></div></form></div></div>"
  );


  $templateCache.put('app/account/signup/stepOne/stepOne.html',
    "<div class=\"form-section signup-section-form\"><div class=triangle-down-left-post></div><div class=signup-sec-wrapper><div class=each-row><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_employee_ID.png></span></div><div class=user-input-section><input type=number max=9999999 ng-class=\"{'error-border':!showErrorMessage}\" class=\"form-control input-boxes login-input-box\" ng-model=user.userId name=empid placeholder=\"Employee Id\" required ng-pattern=\"/^[1-9]\\d*$/\"><div ng-show=!showErrorMessage ng-messages=signupForm.empid.$error class=error-msg-edit><p ng-message=required class=error-msg>Employee ID is required</p><p ng-message=pattern class=error-msg>Invalid Employee ID</p></div></div></div><!-- <div class=\"each-row\">\n" +
    "\t\t\t<div class=\"field-icon-section\"><span><img class=\"icon-style\" src=\"assets/images/icon_username.png\"></span></div>\n" +
    "\t\t\t<div class=\"user-input-section\"><input type=\"text\" ng-class=\"{'error-border':!showErrorMessage}\"  name=\"empName\" class=\"form-control input-boxes login-input-box\" ng-model=\"user.empName\" placeholder=\"NAME\" required>\n" +
    "\t\t\t\t<div ng-show=\"!showErrorMessage\"  ng-messages=\"signupForm.empName.$error\" class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Name is required</p>\n" +
    "\t\t\t\t\t<p ng-message=\"pattern\" class=\"error-msg\">Invalid Name</p>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div> --><div class=each-row><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_mobile_number.png></span></div><div class=user-input-section><input maxlength=10 class=\"form-control input-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" ng-model=user.contactNo type=tel name=contactNo required ng-pattern=\"/^[789]\\d{9}$/\" placeholder=\"Mobile Number\"><div ng-show=!showErrorMessage ng-messages=signupForm.contactNo.$error class=error-msg-edit><p ng-message=required class=error-msg>Contact Number is required</p><p ng-message=pattern class=error-msg>Invalid Contact Number</p></div></div></div><div class=each-row><div class=field-icon-section><span><img class=icon-style src=assets/images/icon_password.png></span></div><div class=user-input-section><input class=\"form-control pwd-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" required type=password ng-model=user.password name=password placeholder=Password><div ng-show=!showErrorMessage ng-messages=signupForm.password.$error class=error-msg-edit><p ng-message=required class=error-msg>Please enter password</p></div></div></div><div id=sites class=\"each-row gender-section\"><div class=\"radio gender-radio\"><label class=rad><input type=radio name=optradio value=Female ng-model=\"user.gender\"><i></i> Female</label></div><div class=\"radio gender-radio\"><label class=rad><input type=radio name=optradio value=Male ng-model=\"user.gender\"><i></i> Male</label></div></div><div class=\"each-row login-page login-btn-sec\" ng-click=register()><span class=login-text>SIGN UP!</span> <img src=assets/images/icon_car.png class=login-car-img></div></div><p class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none terms-condn-section\">By signing up, I agree to <span class=link-text>TCS's terms of service, privacy policy</span> and <span class=link-text>host guarantee terms</span>.</p></div>"
  );


  $templateCache.put('app/account/signup/stepThree/stepThree.html',
    "<div class=\"form-section signup-section-form\"><div class=each-row><div><span><img class=icon-style src=assets/images/icon_username.png></span></div><div><input type=number maxlength=9999999 ng-class=\"{'error-border':!showErrorMessage}\" class=\"form-control input-boxes login-input-box\" ng-model=user.userId name=username placeholder=USERNAME required ng-pattern=\"/^[1-9]\\d*$/\" readonly ng-disabled=true><div ng-show=!showErrorMessage ng-messages=signupForm.username.$error class=error-msg-edit><p ng-message=required class=error-msg>Username is required</p><p ng-message=pattern class=error-msg>Invalid Username</p></div></div></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_password.png></span></div><div><input class=\"form-control pwd-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" required type=password ng-model=user.password name=password placeholder=PASSWORD><div ng-show=!showErrorMessage ng-messages=signupForm.password.$error class=error-msg-edit><p ng-message=required class=error-msg>Please enter password</p></div></div></div><div class=each-row><p class=terms-cond-text>By Signing up, I agree to TCS's <a href=# class=\"global-link float-none\">Terms of Service</a> and <a href=# class=\"global-link float-none\">Privacy Policy</a></p></div><div class=each-row><input type=submit class=submit-buttons name=continue value=REGISTER></div></div>"
  );


  $templateCache.put('app/account/signup/stepTwo/stepTwo.html',
    "<div class=\"form-section signup-section-form signup-two-wrap\"><div class=each-row><div><span><img class=icon-style src=assets/images/icon_home_address.png></span></div><div class=\"input-fields address-fields\"><input ng-class=\"{'error-border':!showErrorMessage}\" name=homeAddress class=\"form-control input-boxes\" ng-model=user.homeAddress placeholder=\"HOME ADDRESS\" required></div><div class=icon-address-fields><span><img class=icon-style src=assets/images/icon_location.png ng-click=getLocation()></span></div><div ng-show=!showErrorMessage ng-messages=signupForm.homeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Home Address is required</p></div></div><div class=each-row><span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_city.png></span></div><div class=input-fields><input ng-class=\"{'error-border':!showErrorMessage}\" name=city class=\"form-control input-boxes login-input-box\" ng-model=user.city placeholder=CITY required ng-pattern=\"/^[a-zA-Z]+(?:[\\s-][a-zA-Z]+)*$/\"></div><div ng-show=!showErrorMessage ng-messages=signupForm.city.$error class=error-msg-edit><p ng-message=required class=error-msg>City is required</p><p ng-message=pattern class=error-msg>Invalid City</p></div></span> <span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_zipcode.png></span></div><div class=input-fields><input type=number ng-class=\"{'error-border':!showErrorMessage}\" name=zipcode class=\"form-control input-boxes login-input-box\" ng-model=user.zipcode placeholder=ZIPCODE max=999999 required ng-pattern=\"/^[123456789]\\d{5}$/\"></div><div ng-show=!showErrorMessage ng-messages=signupForm.homeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Zipcode is required</p><p ng-message=pattern class=error-msg>Invalid Zipcode</p></div></span></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_office_address.png></span></div><div class=\"input-fields office-address-select-wrap\"><!-- <select ui-select2  name=\"officeAddress\" class=\"office-address-select\" ng-model=\"user.officeAddress\" ng-class=\"{'error-border':!showErrorMessage}\" required  data-placeholder=\"OFFICE ADDRESS\">\n" +
    "\t\t\t\t\t<option value=\"\">OFFICE ADDRESS</option>\n" +
    "\t\t\t\t <option ng-repeat=\"oa in officeAddressJSON\" value=\"{{oa}}\">{{oa}}</option>   \n" +
    "\t\t\t</select> --><ui-select search-enabled=false ng-model=user.officeAddress class=office-address-select><ui-select-match placeholder=\"OFFICE ADDRESS\"><span ng-bind=$select.selected.displayAddress></span></ui-select-match><ui-select-choices repeat=\"item in (officeAddressJSON | filter: $select.search)\"><span ng-bind=item.displayAddress></span></ui-select-choices></ui-select>{{user.officeAddress}}</div><div ng-show=!showErrorMessage ng-messages=signupForm.officeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Please select an office address</p></div></div><div class=each-row><span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_time.png></span></div><div class=input-fields><select name=timeSlot class=\"timeslot login-input-box\" ng-model=user.timeSlot ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t for t in timeSlotJSON\"><option style=display:none value=\"\">TIMESLOT</option></select></div><div ng-show=!showErrorMessage ng-messages=signupForm.timeSlot.$error class=error-msg-edit><p ng-message=required class=error-msg>Please select a timeslot</p></div></span> <span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_seat.png></span></div><div class=input-fields><select class=\"seater-select login-input-box\" name=capacity ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=user.vehicle.capacity ng-options=\"c as c for c in vehicleCapacityJSON\"><option style=display:none value=\"\">SEAT</option></select></div><div ng-show=!showErrorMessage ng-messages=signupForm.capacity.$error class=error-msg-edit><p ng-message=required class=error-msg>Please select available seats</p></div></span></div><div class=\"each-row seater-section\"><div><span><img class=icon-style src=assets/images/icon_car.png></span></div><div class=input-fields><input class=\"form-control input-boxes\" ng-class=\"{'error-border':!showErrorMessage}\" maxlength=13 name=vehicleNo required ng-pattern=\"/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/\" ng-model=user.vehicle.vehicleNo placeholder=\"VEHICLE REGISTRATION NUMBER\"></div><div ng-show=!showErrorMessage ng-messages=signupForm.vehicleNo.$error class=error-msg-edit><p ng-message=required class=error-msg>Registration Number is required</p><p ng-message=pattern class=error-msg>Invalid Registration Number</p></div></div><div class=each-row><input type=button class=\"input-buttons login-input-box\" name=continue value=CONTINUE ng-click=goToStep(3)></div></div>"
  );


  $templateCache.put('app/activities/activities.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section avail-ride-header\"><span class=heading>Activities</span> <img src=assets/images/info.svg class=\"pull-right act-info-icon cursor-pointer\" ng-click=getTeam()></div><div class=my-teams-wrapper><div class=triangle-down-left></div><div class=today-activity><p class=activity-header>Today</p><ul class=activity-list ng-if=\"team.activities.length>0\"><li ng-repeat=\"activity in team.activities\"><span class=indic-circle></span> <span class=act-message>{{ activity.activity }}</span><!-- <span class=\"act-time\">{{ activity.activityTime | date:'h:mm:ss a' }}</span> --> <span class=act-time>{{ activity.activityTime | date:'d-M h:mm a' }}</span></li><!-- <li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li> --></ul><p class=no-team-sub-text ng-if=\"team.activities.length<=0\">No activities found.</p></div><!-- <div class=\"yesterday-activity\">\n" +
    "\t\t\t\t<p class=\"activity-header\">Yesterday</p>\n" +
    "\t\t\t\t<ul class=\"activity-list\">\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Siddharth is not commuting today</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</div> --></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img class=home-menu-icon src=assets/images/dashboard-icon/home.png><p class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img class=home-menu-icon src=assets/images/dashboard-icon/history.png><p class=home-menu-text>HISTORY</p></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/admin/admin.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><p>The delete user and user index api routes are restricted to users with the 'admin' role.</p><ul class=list-group><li class=list-group-item ng-repeat=\"user in users\"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class=\"glyphicon glyphicon-trash pull-right\"></span></a></li></ul></div>"
  );


  $templateCache.put('app/availableRides/availableRides.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section avail-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Available Rides</span></div><div class=\"form-section functionality-wrap avail-list-wrap\"><div><div class=triangle-down-left></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 choose-ride-wrap\"><span class=\"choose-img-wrap pull-left\"><img class=choose-ride-hand src=assets/images/available-rides/tap.png></span> <span class=choose-ride-text>Choose your ride</span></div></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 avail-rides-lists-wrap\"><div class=\"col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none each-vailable-ride\" ng-repeat=\"ride in rides track by $index\"><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 avail-list-img-sec\"><img ng-src=\"{{ ride.offeredBy.userPhotoUrl || 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png' }}\" class=\"avail-user-img pull-left\"><p class=avail-user-name>{{ride.offeredBy.empName}}</p><span class=\"pull-left avail-user-gender\">{{ride.offeredBy.gender}}</span> <svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink xmlns:sketch=http://www.bohemiancoding.com/sketch/ns viewbox=\"0 0 30 37.5\" version=1.1 x=0px y=0px class=rating-star><g class=star-border stroke-width=1 fill=none fill-rule=evenodd sketch:type=MSPage><g sketch:type=MSArtboardGroup transform=\"translate(-135.000000, -225.000000)\" class=star-fill><path d=\"M157.114645,251.555278 C157.481459,251.748124 157.910175,251.436643 157.84012,251.02819 L156.482629,243.104663 L162.237212,237.495331 C162.533971,237.206063 162.370216,236.702077 161.960106,236.642484 L154.008037,235.491395 L150.448368,228.278717 C150.264961,227.907094 149.735039,227.907094 149.551632,228.278717 L145.988903,235.487426 L138.039894,236.642484 C137.629784,236.702077 137.466029,237.206063 137.762788,237.495331 L143.518954,243.104181 L142.15988,251.02819 C142.089825,251.436643 142.518541,251.748124 142.885355,251.555278 L150.003413,247.813094 L157.114645,251.555278 Z\" sketch:type=\"MSShapeGroup\"></g></g></svg> <svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink xmlns:sketch=http://www.bohemiancoding.com/sketch/ns viewbox=\"0 0 30 37.5\" version=1.1 x=0px y=0px class=rating-star><g class=star-border stroke-width=1 fill=none fill-rule=evenodd sketch:type=MSPage><g sketch:type=MSArtboardGroup transform=\"translate(-135.000000, -225.000000)\" class=star-fill><path d=\"M157.114645,251.555278 C157.481459,251.748124 157.910175,251.436643 157.84012,251.02819 L156.482629,243.104663 L162.237212,237.495331 C162.533971,237.206063 162.370216,236.702077 161.960106,236.642484 L154.008037,235.491395 L150.448368,228.278717 C150.264961,227.907094 149.735039,227.907094 149.551632,228.278717 L145.988903,235.487426 L138.039894,236.642484 C137.629784,236.702077 137.466029,237.206063 137.762788,237.495331 L143.518954,243.104181 L142.15988,251.02819 C142.089825,251.436643 142.518541,251.748124 142.885355,251.555278 L150.003413,247.813094 L157.114645,251.555278 Z\" sketch:type=\"MSShapeGroup\"></g></g></svg> <svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink xmlns:sketch=http://www.bohemiancoding.com/sketch/ns viewbox=\"0 0 30 37.5\" version=1.1 x=0px y=0px class=\"rating-star rated\"><g class=star-border stroke-width=1 fill=none fill-rule=evenodd sketch:type=MSPage><g sketch:type=MSArtboardGroup transform=\"translate(-135.000000, -225.000000)\" class=star-fill><path d=\"M157.114645,251.555278 C157.481459,251.748124 157.910175,251.436643 157.84012,251.02819 L156.482629,243.104663 L162.237212,237.495331 C162.533971,237.206063 162.370216,236.702077 161.960106,236.642484 L154.008037,235.491395 L150.448368,228.278717 C150.264961,227.907094 149.735039,227.907094 149.551632,228.278717 L145.988903,235.487426 L138.039894,236.642484 C137.629784,236.702077 137.466029,237.206063 137.762788,237.495331 L143.518954,243.104181 L142.15988,251.02819 C142.089825,251.436643 142.518541,251.748124 142.885355,251.555278 L150.003413,247.813094 L157.114645,251.555278 Z\" sketch:type=\"MSShapeGroup\"></g></g></svg> <svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink xmlns:sketch=http://www.bohemiancoding.com/sketch/ns viewbox=\"0 0 30 37.5\" version=1.1 x=0px y=0px class=\"rating-star rated\"><g class=star-border stroke-width=1 fill=none fill-rule=evenodd sketch:type=MSPage><g sketch:type=MSArtboardGroup transform=\"translate(-135.000000, -225.000000)\" class=star-fill><path d=\"M157.114645,251.555278 C157.481459,251.748124 157.910175,251.436643 157.84012,251.02819 L156.482629,243.104663 L162.237212,237.495331 C162.533971,237.206063 162.370216,236.702077 161.960106,236.642484 L154.008037,235.491395 L150.448368,228.278717 C150.264961,227.907094 149.735039,227.907094 149.551632,228.278717 L145.988903,235.487426 L138.039894,236.642484 C137.629784,236.702077 137.466029,237.206063 137.762788,237.495331 L143.518954,243.104181 L142.15988,251.02819 C142.089825,251.436643 142.518541,251.748124 142.885355,251.555278 L150.003413,247.813094 L157.114645,251.555278 Z\" sketch:type=\"MSShapeGroup\"></g></g></svg> <svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink xmlns:sketch=http://www.bohemiancoding.com/sketch/ns viewbox=\"0 0 30 37.5\" version=1.1 x=0px y=0px class=\"rating-star rated\"><g class=star-border stroke-width=1 fill=none fill-rule=evenodd sketch:type=MSPage><g sketch:type=MSArtboardGroup transform=\"translate(-135.000000, -225.000000)\" class=star-fill><path d=\"M157.114645,251.555278 C157.481459,251.748124 157.910175,251.436643 157.84012,251.02819 L156.482629,243.104663 L162.237212,237.495331 C162.533971,237.206063 162.370216,236.702077 161.960106,236.642484 L154.008037,235.491395 L150.448368,228.278717 C150.264961,227.907094 149.735039,227.907094 149.551632,228.278717 L145.988903,235.487426 L138.039894,236.642484 C137.629784,236.702077 137.466029,237.206063 137.762788,237.495331 L143.518954,243.104181 L142.15988,251.02819 C142.089825,251.436643 142.518541,251.748124 142.885355,251.555278 L150.003413,247.813094 L157.114645,251.555278 Z\" sketch:type=\"MSShapeGroup\"></g></g></svg></div><div class=\"col-md-6 col-sm-6 col-xs-6 avail-left-sec\"><div class=each-info-line><img class=avai-ride-info-icon src=assets/images/available-rides/starting-time.png> <span class=avail-ride-date>{{ride.rideScheduledTime | date:'hh:mm a'}}</span></div></div><div class=\"col-md-6 col-sm-6 col-xs-6 avail-right-sec\"><div class=avail-right-info><span class=\"available-seat-count pull-right\">{{ride.currentlyAvailableSeats}}</span> <span class=\"pull-right seat-avail-label\">Seats Available</span></div></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 avail-ride-address-wrap\"><img class=avai-ride-info-icon src=assets/images/available-rides/from-icon.png> <span class=address-text>{{ride.startLocation.display_address}} <span class=\"glyphicon glyphicon-chevron-right\"></span></span> <span class=address-text>{{ride.endLocation.display_address}}</span></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 via-sec\"><img class=avai-ride-info-icon src=assets/images/available-rides/from-icon.png> <span>{{ride.routeSummary}}</span></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 seat-sec\"><img class=\"avai-ride-info-icon pull-left\" src=assets/images/available-rides/from-icon.png> <span class=\"pull-left select-text\">Select a seat</span> <img ng-repeat=\"seat in ride.seatMap track by $index\" class=seat-info-img ng-src=\"{{seat._id  && 'assets/images/available-rides/filled_seat.png' || seat.selected && 'assets/images/available-rides/Tap_seat.png' || 'assets/images/available-rides/vacantSeat.png'}}\" ng-click=\"selectSeat(seat)\"></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 avail-proceed-wrap\"><span ng-click=selectRide(ride)>BOOK MY RIDE!</span> <img class=avail-proceed-img src=assets/images/available-rides/avail-car.png></div></div></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/currentRide/currentRide.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section avail-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Current Ride</span></div><div class=\"form-section functionality-wrap avail-list-wrap\"><div class=triangle-down-left></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 choose-ride-wrap\"><span class=choose-ride-text>Live Tracking</span></div><div class=today-activity><p class=activity-header>Today</p><ul class=activity-list><li><span class=indic-circle></span> <span class=act-message>Siddharth is not commuting today</span> <span class=act-time>8:00 AM</span></li><li><span class=indic-circle></span> <span class=act-message>Jagdeep joined the commute</span> <span class=act-time>8:00 AM</span></li></ul></div><div class=yesterday-activity><p class=activity-header>Yesterday</p><ul class=activity-list><li><span class=indic-circle></span> <span class=act-message>Siddharth is not commuting today</span> <span class=act-time>8:00 AM</span></li><li><span class=indic-circle></span> <span class=act-message>Jagdeep joined the commute</span> <span class=act-time>8:00 AM</span></li><li><span class=indic-circle></span> <span class=act-message>Jagdeep joined the commute</span> <span class=act-time>8:00 AM</span></li><li><span class=indic-circle></span> <span class=act-message>Jagdeep joined the commute</span> <span class=act-time>8:00 AM</span></li><li><span class=indic-circle></span> <span class=act-message>Jagdeep joined the commute</span> <span class=act-time>8:00 AM</span></li></ul></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/formTeam/formTeam.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><!-- \t\t\t<span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Form a team</span></div><form name=userProfileUpdateForm class=\"container login-container post-ride-container animation-form-signup\" novalidate><div class=triangle-down-left-post></div><div class=\"form-section signup-section-form post-ride-form\"><div class=each-row><div class=icon-address-fields><img class=\"post-ride-from-icon team-name-icon\" src=assets/images/available-rides/from-icon.png></div><div class=from-address-post-wrap><label class=field-label>Team name</label><input ng-model=team.teamName class=\"form-control login-input-box team-name-field\"></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/from-icon.png ng-click=\"optionAddressOptions('from')\"></div><div id=postFromSec class=from-address-post-wrap><label class=\"field-label from\">Home</label><input tab-index=1 ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\" name=homeAddress required ng-model=team.rideDetails.from g-places-autocomplete><!-- <p class=\"current-loc-sec\"><img src=\"assets/images/current_location.png\">Use current location</p> --><div ng-show=!showErrorMessage ng-messages=postRideForm.rideSource.$error class=error-msg-edit><p ng-message=required class=error-msg>Ride source is required</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/to.png ng-click=\"optionAddressOptions('to')\"></div><div id=postToSec class=from-address-post-wrap><label class=\"field-label from\">Office</label><select ng-options=\"item as item.display_address for item in officeAddressJSON\" ng-model=team.rideDetails.to name=officeAddress class=post-ofc-address><option style=display:none value=\"\">Office Address</option></select><div ng-show=!showErrorMessage ng-messages=postRideForm.rideDestination.$error class=error-msg-edit><p ng-message=required class=error-msg>Ride destination is required</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=\"post-ride-from-icon from\" src=assets/images/available-rides/starting-time.png></div><div class=from-address-post-wrap><label class=\"field-label from\">Shift start time</label><select name=leavingIn class=\"timeslot post-ride-leaving-in\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t.start for t in timeSlotJSON\" ng-model=team.rideDetails.ridePreferredTime></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.leavingIn.$error class=error-msg-edit><p ng-message=required class=error-msg>Start time is req.</p></div></div><div class=each-row><div class=icon-address-fields><img class=\"post-ride-from-icon from\" src=assets/images/available-rides/starting-time.png></div><div class=from-address-post-wrap><label class=\"field-label from\">Shift end time</label><select name=leavingIn class=\"timeslot post-ride-leaving-in\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t.end for t in timeSlotJSON\" ng-model=team.rideDetails.ridePreferredTime></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.leavingIn.$error class=error-msg-edit><p ng-message=required class=error-msg>Start time is req.</p></div></div><label class=\"field-label route\">Tap to select a route</label></div><leaflet class=\"leaflet team\" markers=markers lf-center=center event-broadcast=events id=analyzeon defaults=defaults paths=mypath></leaflet><div class=\"each-row post-ride-continue\" name=syncData ng-click=findTeamMembers()>FIND MEMBERS... <img class=post-continue-img src=assets/images/icon_car.png></div></form></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/home/home.html',
    "<div class=\"page-wrapper home-page\"><div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer avail-header-back\" ng-click=\"toggleHamburger()\"></span> --></div><div class=home-content-wrapper><p class=home-welcome-text>Welcome <span class=welcome-username>{{firstName}}</span></p><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none on-the-fly-sec\"><p class=on-the-fly-text><span class=first-letter>O</span>n <span class=first-letter>T</span>he <span class=first-letter>F</span>ly</p><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none take-post-btn-sec\"><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pull-left pad-L-none\"><img src=assets/images/dashboard-icon/postRide.png class=option-icon ng-click=postRide()><p ng-click=postRide() class=option-text>POST A RIDE</p></div><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pull-left pad-L-none\"><img src=assets/images/dashboard-icon/takeRide.png class=option-icon ng-click=takeRide()><p ng-click=takeRide() class=option-text>TAKE A RIDE</p></div></div><div class=or-sec>OR</div></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none pooling-section\"><p class=car-pooling-text><span class=first-letter>C</span>ar <span class=first-letter>P</span>ooling</p><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none for-team-btn-sec\"><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pull-left pad-L-none\"><img src=assets/images/dashboard-icon/formTeam.png ui-sref=formTeam class=option-icon><p ui-sref=formTeam class=option-text>FORM A TEAM</p></div><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pull-left pad-L-none\"><img src=assets/images/dashboard-icon/myTeams.png class=option-icon ng-click=openMyTeam()><p ng-click=openMyTeam() class=option-text>MY TEAMS</p></div></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon ui-sref=userHome.rideStatus src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text ui-sref=userHome.rideStatus>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/intro/intro.html',
    "<section id=features class=blue ng-init=\"index=2\"><div class=content><slick dots=true infinite=false speed=300 slides-to-show=1 touch-move=false slides-to-scroll=1 class=\"slider one-time\"><div class=slide-wrap><div class=\"slide-info-section slide-1\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_search.png></div><p>Find a companion</p><p>to commute with</p></div></div><div class=slide-wrap><div class=\"slide-info-section slide-2\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_save_exp.png></div><p>Share fuel costs</p><p>and experiences</p></div></div><div class=slide-wrap><div class=\"slide-info-section slide-3\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_make_friend.png></div><p>Make new friends</p><p>while commuting</p></div></div><div class=slide-wrap><div class=\"slide-info-section slide-4\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_make_friend.png></div><p>Save fuel, reduce traffic</p><p>and save earth</p><div class=get-started-section><a class=get-started-link ui-sref=main>Get Started</a></div></div></div></slick><!-- <p ng-click=\"index=4\">Change index to 4</p>\n" +
    "    <br> --><!-- <hr/> --><!--   <h2>Multiple Items</h2>\n" +
    "    <slick slides-to-show=3 slides-to-scroll=3 init-onload=true data=\"awesomeThings\" class=\"slider multiple-items\">\n" +
    "      <div ng-repeat=\"thing in awesomeThings\"><h3>{{ thing }}</h3></div>\n" +
    "    </slick>\n" +
    "    <hr/>\n" +
    "\n" +
    "\n" +
    "    <h2>One At A Time</h2>\n" +
    "    <slick dots=\"true\" infinite=\"false\" speed=300 slides-to-show=5 touch-move=\"false\" slides-to-scroll=1 class=\"slider one-time\">\n" +
    "      <div><h3>1</h3></div>\n" +
    "      <div><h3>2</h3></div>\n" +
    "      <div><h3>3</h3></div>\n" +
    "      <div><h3>4</h3></div>\n" +
    "      <div><h3>5</h3></div>\n" +
    "      <div><h3>6</h3></div>\n" +
    "    </slick>\n" +
    "    \n" +
    "\n" +
    "    <br>\n" +
    "    <hr/>\n" +
    "    <h2>Lazy Loading</h2>\n" +
    "    <slick lazy-load='ondemand' slides-to-show=3 slides-to-scroll=1 class=\"slider lazy\">\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz1.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz2.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz3.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz4.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz5.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz6.png\"/></div></div>\n" +
    "    </slick> --></div></section>"
  );


  $templateCache.put('app/main/introductionCarousel.html',
    "<section id=features class=blue ng-init=\"index=2\"><div class=content><h2>Single Item</h2><slick class=\"slider single-item\" current-index=index responsive=breakpoints slides-to-show=3 slides-to-scroll=3><div ng-repeat=\"i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]\"><h3>{{ i }}</h3></div><p>Current index: {{ index }}</p></slick><p ng-click=\"index=4\">Change index to 4</p><br><hr><!--   <h2>Multiple Items</h2>\n" +
    "    <slick slides-to-show=3 slides-to-scroll=3 init-onload=true data=\"awesomeThings\" class=\"slider multiple-items\">\n" +
    "      <div ng-repeat=\"thing in awesomeThings\"><h3>{{ thing }}</h3></div>\n" +
    "    </slick>\n" +
    "    <hr/>\n" +
    "    <h2>One At A Time</h2>\n" +
    "    <slick dots=\"true\" infinite=\"false\" speed=300 slides-to-show=5 touch-move=\"false\" slides-to-scroll=1 class=\"slider one-time\">\n" +
    "      <div><h3>1</h3></div>\n" +
    "      <div><h3>2</h3></div>\n" +
    "      <div><h3>3</h3></div>\n" +
    "      <div><h3>4</h3></div>\n" +
    "      <div><h3>5</h3></div>\n" +
    "      <div><h3>6</h3></div>\n" +
    "    </slick>\n" +
    "    <br>\n" +
    "    <hr/>\n" +
    "    <h2>Lazy Loading</h2>\n" +
    "    <slick lazy-load='ondemand' slides-to-show=3 slides-to-scroll=1 class=\"slider lazy\">\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz1.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz2.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz3.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz4.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz5.png\"/></div></div>\n" +
    "      <div><div class=\"image\"><img data-lazy=\"images/lazyfonz6.png\"/></div></div>\n" +
    "    </slick> --></div></section>"
  );


  $templateCache.put('app/main/main.html',
    "<div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 main-page-wrapper\"><!-- <div class=\"\">\n" +
    "\t\t<div class=\"col-md-12 col-sm-12 col-xs-12 location-section\">\n" +
    "\t\t\t<div class=\"col-md-12 col-sm-12 col-xs-12 content-wrapper map-content-wrapper\">\n" +
    "\t\t\t\t<svg class=\"map-svg\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 100 125\" style=\"enable-background:new 0 0 100 100;\" xml:space=\"preserve\">\n" +
    "\t\t\t\t\t<path class=\"path-0\" d=\"M73.5,48.3l-1.4,2.4l5.9,2.5l-7.8,4.5l-1.6-0.9l-0.3,0.5l1.3,0.7L67,59.4l-0.6,1.1l3.8-2.2l8.6,4.7l-8.9,5.5  L62,63l1.1-0.7l-0.3-0.5l-1.4,0.8l-5.9-4.1l4.1-2.2l-0.3-0.5L55,58.1l-4.7-3.3l6.6-3.4L56,49.9l-3-1.6l1.6-0.8l-0.3-0.5l-1.9,1  L48.9,46l3.8-1.8l-0.3-0.5l-4.2,2L45,43.9l5.5-2.6l0.7,0.3l-1.1-1.9l-12.9,5.9l-14.3-3.6L5,50.3l10.2,41.3l36.6-22.1l21.3,1.4  L95,56.9L73.5,48.3z M54.8,58.9l0.1-0.1l5.3,3.7l-7.3-1l-5-4l6.9,1.2L54.8,58.9z M41.8,53.5l3.8,3L37.2,55l-0.1-0.1l-0.1,0l-3.2-3  L41.8,53.5z M33.1,51.1L33,51l-0.1,0l-2.4-2.2l7.3,1.6l2.9,2.3L33.1,51.1z M39.2,50.6l5.9,1.3l0.1,0.1l0.1-0.1l3,2.1L42,52.9  L39.2,50.6z M38.1,49.8L36,48.1l5.5,1.3l0.1,0.1l0.1-0.1l2.3,1.6L38.1,49.8z M36.7,49.5l-7-1.5l-0.1-0.1l-0.1,0l-1.8-1.7l6.7,1.6  L36.7,49.5z M29,48.1l-8.2,4l-1.7-2.5l7.6-3.6L29,48.1z M29.5,48.6l2.9,2.7l-9.1,4.6l-2.1-3.2L29.5,48.6z M32.8,51.7l3.7,3.5  l-10.2,5.3l-2.7-4.2L32.8,51.7z M37,55.7l4.8,4.6l-11.5,6.4l-3.6-5.5L37,55.7z M38,55.8l8.6,1.5l5.1,4L42.5,60l-0.1-0.1l-0.1,0  L38,55.8z M53.7,57.9l-6.8-1.2l-3.8-3l6.4,1.3l0.1,0.1l0.1-0.1L53.7,57.9z M56.5,50.9l-6.8,3.5l-3.8-2.7l6.4-3.2L56.5,50.9z   M51.6,48.2l-6.3,3.1l-3.1-2.2l5.9-2.8L51.6,48.2z M44.3,44.2l3.2,1.7l-5.8,2.8l-2.8-2L44.3,44.2z M38.2,46.8L38.1,47l2.1,1.4  l-5.3-1.3l-2.2-1.7L38.2,46.8z M31.6,45.2l-0.1,0.1l1.9,1.5L27,45.3l-0.1-0.1l-0.1,0l-1.7-1.7L31.6,45.2z M24.2,43.6l2.1,1.9  l-7.5,3.5l-1.5-2.3L24.2,43.6z M9.1,50.5l7.6-3.5l1.5,2.3l-8.2,3.9L9.1,50.5z M10.1,53.8l8.4-4l1.7,2.5l-9.1,4.4L10.1,53.8z   M11.3,57.4l9.2-4.5l2.1,3.2l-10.1,5.1L11.3,57.4z M12.8,61.8L23,56.7l2.7,4.2l-11.3,5.9L12.8,61.8z M14.6,67.4l11.5-6l3.6,5.6  l-12.9,7.1L14.6,67.4z M20.1,84.3L17,74.7l13.1-7.2l5.2,7.9L20.1,84.3z M35.7,75l-5.1-7.9l11.7-6.4l6.8,6.4L35.7,75z M49.7,67  L49.7,67l-6.5-6.2l9.4,1.3l7.4,5.8L49.7,67z M60.9,68L60.9,68l-7.1-5.7l7.4,1l0.1,0.1l0.1-0.1l7.6,5.3L60.9,68z M70.8,58l7.9-4.5  l9.2,4l-8.5,5.2L70.8,58z\"/>\n" +
    "\t\t\t\t\t<g>\n" +
    "\t\t\t\t\t\t<path class=\"path-1\" fill=\"#02A554\" d=\"M78.9,16.9c-3-5.2-8.6-8.5-14.7-8.5c-6,0-11.6,3.2-14.7,8.5c-3,5.2-3,11.7,0,16.9c4.9,8.5,9.8,16.9,14.7,25.4   c4.9-8.5,9.8-16.9,14.7-25.4C82,28.6,82,22.2,78.9,16.9z M64.3,34.9c-5.3,0-9.5-4.3-9.5-9.5c0-5.3,4.3-9.5,9.5-9.5   c5.3,0,9.5,4.3,9.5,9.5C73.8,30.7,69.5,34.9,64.3,34.9z\"/>\n" +
    "\t\t\t\t\t</g></svg>\n" +
    "\t\t\t\t\t<div class=\"col-md-12 col-sm-12 col-xs-12\">\n" +
    "\t\t\t\t\t\t<input type=\"button\" class=\"locate-me\" value=\"LOCATE ME\" ng-click=\"openMap()\">\n" +
    "\t\t\t\t\t\t<input type=\"button\" class=\"locate-me\" value=\"SYNC\" ng-click=\"fetch()\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t\t<div class=\"col-md-12 col-sm-12 col-xs-12 mainpage-signup-section\">\n" +
    "\t\t\t<div class=\"col-md-12 col-sm-12 col-xs-12 content-wrapper\">\n" +
    "\t\t\t\t<svg class=\"signup-main-svg\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 100 125\" enable-background=\"new 0 0 100 100\" xml:space=\"preserve\"><g>\n" +
    "\t\t\t\t\t<path class=\"path-0\" d=\"M95.438,80.064H33.325V68.491l12.114-5.922c0.251-1.752,0.938-4.743,2.756-5.828v-3.81   c-0.067-0.41-0.265-1.121-0.566-1.498c-0.932-1.165-2.117-4.371-2.561-6.852c-0.423-0.493-1.016-1.379-1.311-2.703   c-0.035-0.159-0.081-0.349-0.132-0.562c-0.601-2.493-1.053-4.842,0.001-6.182c0.183-0.232,0.401-0.421,0.646-0.564   c-0.357-3.267-0.914-10.742,1.024-13.812c2.468-3.907,8.334-8.259,12.807-8.259h2.645c4.473,0,10.34,4.353,12.808,8.259   c1.938,3.07,1.382,10.545,1.024,13.812c0.245,0.143,0.463,0.333,0.646,0.564c1.055,1.339,0.602,3.688,0,6.182   c-0.052,0.213-0.098,0.403-0.133,0.561c-0.294,1.324-0.886,2.209-1.309,2.703c-0.444,2.486-1.631,5.693-2.562,6.854   c-0.298,0.373-0.495,1.081-0.563,1.497v3.808c1.796,1.073,2.487,4.006,2.745,5.767c2.253,0.929,8.825,3.633,14.924,6.101   c8.072,3.27,9.745,8.237,9.812,8.447c0.168,0.511,0.177,1.309-0.312,1.985C97.488,79.507,96.799,80.064,95.438,80.064z    M36.325,77.064h58.491c-0.813-1.308-2.874-3.756-7.615-5.676c-7.518-3.043-15.754-6.443-15.754-6.443l-0.835-0.345l-0.086-0.901   c-0.205-2.149-0.942-4.151-1.416-4.377h-1.5l0.048-1.49l0.012-5.194c0.023-0.189,0.259-1.885,1.21-3.077   c0.488-0.609,1.673-3.515,2.015-5.896l0.084-0.586l0.462-0.371l0,0c-0.003,0,0.498-0.462,0.725-1.481   c0.038-0.173,0.088-0.381,0.145-0.614c0.364-1.512,0.553-2.588,0.562-3.215l-1.713,0.49l0.271-2.27   c0.557-3.993,0.938-11.124-0.41-13.259c-1.963-3.107-6.983-6.86-10.271-6.86h-2.645c-3.288,0-8.307,3.753-10.271,6.861   c-1.348,2.135-0.967,9.265-0.41,13.258l0.319,2.283l-1.761-0.503c0.009,0.626,0.197,1.703,0.561,3.215   c0.056,0.233,0.106,0.441,0.145,0.613c0.228,1.024,0.733,1.485,0.755,1.505l0.407,0.364l0.11,0.569   c0.34,2.376,1.525,5.284,2.013,5.894c0.953,1.192,1.188,2.888,1.212,3.078l0.012,0.186v6.509h-1.5   c-0.426,0.216-1.164,2.219-1.37,4.368l-0.08,0.836l-11.919,5.828V77.064z\"/>\n" +
    "\t\t\t\t\t<path class=\"path-1\"  fill=\"#02A554\"  d=\"M21.687,90.104H11.403v-10.06H1.343V69.76h10.06V59.699h10.284V69.76h10.06v10.284h-10.06V90.104z M14.403,87.104h4.284   v-10.06h10.06V72.76h-10.06V62.699h-4.284V72.76H4.343v4.284h10.06V87.104z\"/>\n" +
    "\t\t\t\t</g></svg>\n" +
    "\t\t\t\t<div class=\"col-md-12 col-sm-12 col-xs-12\">\n" +
    "\t\t\t\t\t\t<input type=\"button\" class=\"locate-me\" value=\"SIGN UP\" ng-click=\"openSignupForm()\">\n" +
    "\t\t\t\t\t\t<input type=\"button\" class=\"locate-me\" value=\"Test App\" ui-sref=\"userHome.home\">\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</div> --><div class=login-signup-comb-wrap><p class=commute-buddy-text>Commute<span class=buddy-text>Buddy</span></p><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 btn-wrapper\"><div class=\"each-row login-page login-btn-sec\" ng-click=gotoLogin()><span class=login-text>LOGIN...</span> <img src=assets/images/icon_car.png class=login-car-img></div><div class=\"each-row login-page new-btn-sec\" ng-click=openSignupForm()><span class=login-text>I AM NEW...</span> <img src=assets/images/icon_car.png class=login-car-img></div></div></div><p class=powered-by-text>Powered by <span class=tata-text>TATA Consultancy Services</span></p></div>"
  );


  $templateCache.put('app/main/trackMyLocation.html',
    "<p>Locate Me</p><div id=mapCanvas style=width:500px;height:380px></div><button ng-click=startTracking()>Find my Location</button>"
  );


  $templateCache.put('app/map/map.html',
    "<p>Locate Me</p><div id=mapCanvas style=width:500px;height:380px></div><button ng-click=startTracking()>Find my Location</button>"
  );


  $templateCache.put('app/myteams/myteams.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section avail-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>My teams</span></div><div class=my-teams-wrapper><div class=triangle-down-left></div><div class=my-team-content><ul class=team-list ng-if=\"teams.length>0\"><li ng-repeat=\"team in teams track by $index\"><span class=count-sec ng-click=openteamDetails(team._id)>{{$index + 1}}</span> <span class=team-name-sec ng-click=openteamDetails(team._id)>{{team.name}}</span></li></ul><div class=no-team-section ng-if=\"teams.length<=0\"><p>No Teams Yet</p><p class=no-team-sub-text>As you are new user, So please create your team first.</p><button class=create-team-btn ng-click=goToCreateTeamPage()>Create New</button></div><!-- <div >\n" +
    "\t\t\t\t\t<span class=\"count-sec\" ng-click=\"openteamDetails(team._id)\">{{$index + 1}}</span>\n" +
    "\t\t\t\t\t<span class=\"team-name-sec\" ng-click=\"openteamDetails(team._id)\">{{team.name}}</span>\n" +
    "\t\t\t\t</div> --></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/postRides/postRideOneTime.html',
    "<div class=\"page-wrapper post-ride-wrap-one\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><span class=heading>Post a Ride</span></div><form name=userProfileUpdateForm class=\"container login-container post-ride-container animation-form-signup\" novalidate><div class=triangle-down-left-post></div><div class=\"form-section signup-section-form post-ride-form\"><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/from-icon.png ng-click=\"optionAddressOptions('from')\"></div><div id=postFromSec class=from-address-post-wrap><label class=\"field-label from\">Vehicle No.</label><input class=\"form-control input-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" maxlength=13 name=vehicleNo required ng-pattern=\"/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/\" ng-model=user.vehicle.vehicleNo placeholder=\"MyCar No.\"><div ng-show=!showErrorMessage ng-messages=signupForm.vehicleNo.$error class=error-msg-edit><p ng-message=required class=error-msg>Registration Number is required</p><p ng-message=pattern class=error-msg>Invalid Registration Number</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/seats_avalaible.png></div><div class=from-address-post-wrap><select class=\"timeslot post-ride-leaving-in\" name=availableSeats ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=ride.availableSeats ng-options=\"c as c for c in availableSeatsJSON\"><option style=display:none value=\"\">Seats available</option></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.availableSeats.$error class=error-msg-edit><p ng-message=required class=error-msg>Available seats is required</p></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/from-icon.png ng-click=\"optionAddressOptions('from')\"></div><div class=from-address-post-wrap><input tab-index=1 ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\" name=homeAddress placeholder=\"Home address\" required><div class=error-msg-edit><p ng-message=required class=error-msg>Home address is required</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/to.png ng-click=\"optionAddressOptions('to')\"></div><div class=from-address-post-wrap><input tab-index=1 ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\" name=officeAddress placeholder=\"Office address\" required><!-- ng-click=\"moveLabelUp('postToSec')\"\n" +
    "\t\t                ng-blur=\"moveLabelDown('postToSec','postTo')\" ng-focus=\"moveLabelUp('postToSec')\" --><div class=error-msg-edit><p ng-message=required class=error-msg>Office address is required</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/starting-time.png></div><div class=from-address-post-wrap><select name=leavingIn class=\"timeslot post-ride-leaving-in\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t.value as t.text for t in leavingInJSON\"><option style=display:none value=\"\">Shift start time</option></select></div><div class=error-msg-edit><p ng-message=required class=error-msg>shift time is required</p></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/starting-time.png></div><div class=from-address-post-wrap><select name=leavingIn class=\"timeslot post-ride-leaving-in\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t.value as t.text for t in leavingInJSON\"><option style=display:none value=\"\">Shift end time</option></select></div><div class=error-msg-edit><p ng-message=required class=error-msg>shift time is required</p></div></div></div><div class=\"each-row post-ride-continue\" name=\"\" ng-click=\"\">TAKE ME AHEAD... <img class=post-continue-img src=assets/images/icon_car.png></div></form></div></div>"
  );


  $templateCache.put('app/postRides/postRides.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Post a Ride</span></div><form name=userProfileUpdateForm class=\"container login-container post-ride-container animation-form-signup\" novalidate><div class=triangle-down-left-post></div><div class=\"form-section signup-section-form post-ride-form\"><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/from-icon.png ng-click=\"optionAddressOptions('from')\"></div><div id=postFromSec class=from-address-post-wrap><label class=\"field-label from\">From</label><select ng-model=rideData.from class=\"timeslot post-ride-leaving-in\" ng-change=fromChanged(rideData.from)><option>Home</option><option>Office</option><!-- <option>Other</option> --></select><!-- <p class=\"current-loc-sec\"><img src=\"assets/images/current_location.png\">Use current location</p> --><div ng-show=!showErrorMessage ng-messages=postRideForm.rideSource.$error class=error-msg-edit><p ng-message=required class=error-msg>Ride source is required</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/to.png ng-click=\"optionAddressOptions('to')\"></div><div id=postToSec class=from-address-post-wrap><label class=\"field-label from\">To</label><select name=rideDestination placeholder=To required ng-model=rideData.to class=\"timeslot post-ride-leaving-in\" ng-change=toChanged(rideData.to)><option>Home</option><option>Office</option><!-- <option>Other</option> --></select><div ng-show=!showErrorMessage ng-messages=postRideForm.rideDestination.$error class=error-msg-edit><p ng-message=required class=error-msg>Ride destination is required</p></div></div></div><div class=each-row><div class=icon-address-fields><img class=\"post-ride-from-icon from\" src=assets/images/available-rides/starting-time.png></div><div class=from-address-post-wrap><label class=\"field-label from\">Starting at</label><select name=leavingIn class=\"timeslot post-ride-leaving-in\" ng-model=rideData.leavingIn ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t.value as t.text for t in leavingInJSON\"></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.leavingIn.$error class=error-msg-edit><p ng-message=required class=error-msg>Starting time is required</p></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/seats_avalaible.png></div><div class=from-address-post-wrap><label class=\"field-label from\">Seats available</label><select class=\"timeslot post-ride-leaving-in\" name=availableSeats ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=rideData.availableSeats ng-options=\"c as c for c in availableSeatsJSON\"><option style=display:none value=\"\">Seats available</option></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.availableSeats.$error class=error-msg-edit><p ng-message=required class=error-msg>Available seats is required</p></div></div><label class=\"field-label route\">Tap to select a route</label></div><leaflet class=leaflet markers=markers lf-center=center event-broadcast=events id=analyzeon defaults=defaults paths=mypath name=routeSummary></leaflet><div class=\"each-row post-ride-continue\" name=syncData ng-click=postRide()>POST MY RIDE! <img class=post-continue-img src=assets/images/icon_car.png></div></form></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/rideDetails/rideDetails.html',
    "<div class=\"page-wrapper post-ride-wrap-one\">\t\n" +
    "\t<div class=\"container login-container user-home-container pad-R-none pad-L-none\"  scroll ng-class=\"{availheaderback:boolChangeClass}\">\n" +
    "\t\t<div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\">\n" +
    "\t\t\t<!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> -->\n" +
    "\t\t\t<span class=\"heading\">{{pageHeader}}</span>\n" +
    "\t\t</div>\n" +
    "\t\t<form name=\"userProfileUpdateForm\" class=\"container login-container post-ride-container animation-form-signup\" novalidate>\n" +
    "\t\t\t<div class=\"triangle-down-left-post\"></div>\t\n" +
    "\t\t\t<div class=\"form-section signup-section-form post-ride-form\">\n" +
    "\t\t\t\t\n" +
    "\t\t\t\t<div class=\"each-row\" ng-hide=\"hideVehicleDetails\">\n" +
    "\t\t\t\t\t<div class=\"icon-address-fields\">\n" +
    "\t\t\t\t\t\t<img class=\"post-ride-from-icon\" src=\"assets/images/car-front.png\" width=\"30px\" height=\"45px\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div id=\"postFromSec\" class=\"from-address-post-wrap\">\n" +
    "\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\tRegistration No.\n" +
    "\t\t\t\t\t\t</label>\n" +
    "\t\t                <input class=\"form-control input-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" type=\"text\" maxlength=\"13\" name=\"vehicleNo\" required ng-pattern=\"/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/\" ng-model=\"user.vehicle[0].vehicleLicenseNumber\" placeholder=\"\">\n" +
    "\t\t                <div ng-show=\"!showErrorMessage\"  ng-messages=\"signupForm.vehicleNo.$error\" class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Registration Number is required</p>\n" +
    "\t\t\t\t\t\t\t<p ng-message=\"pattern\" class=\"error-msg\">Invalid Registration Number</p>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t<div class=\"each-row\" ng-hide=\"hideVehicleDetails\">\n" +
    "\t\t\t\t\t<div class=\"icon-address-fields\">\n" +
    "\t\t\t\t\t\t<img class=\"post-ride-from-icon\" src=\"assets/images/available-rides/seats_avalaible.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"from-address-post-wrap\">\n" +
    "\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\tSeats available\n" +
    "\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t<select class=\"timeslot post-ride-leaving-in\" name=\"availableSeats\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=\"user.vehicle[0].capacity\" ng-options=\"c as c for c in vehicleCapacityJSON\">\n" +
    "\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div ng-show=\"!showErrorMessage\"  ng-messages=\"postRideForm.availableSeats.$error\" class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Available seats is required</p>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<div class=\"each-row\">\n" +
    "\t\t\t\t\t<div class=\"icon-address-fields\">\n" +
    "\t\t\t\t\t\t<img class=\"post-ride-from-icon\" src=\"assets/images/available-rides/from-icon.png\" ng-click=\"optionAddressOptions('from')\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div id=\"\" class=\"from-address-post-wrap\">\n" +
    "\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\tHome address\n" +
    "\t\t\t\t\t\t</label>\t\t\t\t\t\t\n" +
    "\t\t                <input tab-index=\"1\" id=\"\" ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\"  type=\"text\" name=\"homeAddress\" placeholder=\"\" required\n" +
    "\t\t                ng-model='user.homeAddress' g-places-autocomplete options=\"autocompleteOptions\">\n" +
    "\t\t                <div class=\"error-msg-edit\" ng-messages=\"postRideForm.homeAddress.$error\">\n" +
    "\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Home address is required</p>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t\t<span class=\"error-msg\" style\"color: red;\" ng-show=\"userProfileUpdateForm.homeAddress.$error.useautocomplete\">Please use autocomplete to select Home address</span>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t\n" +
    "\t\t\t\t<div class=\"each-row\">\n" +
    "\t\t\t\t\t<div class=\"icon-address-fields\">\n" +
    "\t\t\t\t\t\t<img class=\"post-ride-from-icon\" src=\"assets/images/available-rides/to.png\" ng-click=\"optionAddressOptions('to')\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div id=\"\" class=\"from-address-post-wrap\">\n" +
    "\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\tOffice address\n" +
    "\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t<select ng-options='item as item.display_address for item in officeAddressJSON' ng-model='user.officeAddress' name='officeAddress'\n" +
    "\t\t\t\t\t\tclass=\"post-ofc-address\">\n" +
    "\t\t\t\t\t\t\n" +
    "\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t<!--  <ui-select search-enabled=\"false\" ng-model=\"user.officeAddress\" class=\"office-address-select\">\n" +
    "\t\t\t\t\t\t    <ui-select-match placeholder=\"OFFICE ADDRESS\">\n" +
    "\t\t\t\t\t\t        <span ng-bind=\"$select.selected.displayAddress\"></span>\n" +
    "\t\t\t\t\t\t    </ui-select-match>\n" +
    "\t\t\t\t\t\t    <ui-select-choices repeat=\"item in (officeAddressJSON | filter: $select.search)\">\n" +
    "\t\t\t\t\t\t        <span ng-bind=\"item.displayAddress\"></span>\n" +
    "\t\t\t\t\t\t    </ui-select-choices>\n" +
    "\t\t\t\t\t\t</ui-select> -->\n" +
    "\n" +
    "\t\t                 <!-- ng-click=\"moveLabelUp('postToSec')\"\n" +
    "\t\t                ng-blur=\"moveLabelDown('postToSec','postTo')\" ng-focus=\"moveLabelUp('postToSec')\" -->\n" +
    "\t\t                 <div  class=\"error-msg-edit\" ng-messages=\"postRideForm.officeAddress.$error\">\n" +
    "\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Office address is required</p>\n" +
    "\t\t\t\t\t\t</div> \n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<div class=\"each-row\">\n" +
    "\t\t\t\t\t<div class=\"icon-address-fields\">\n" +
    "\t\t\t\t\t\t<img class=\"post-ride-from-icon\" src=\"assets/images/available-rides/starting-time.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"from-address-post-wrap\">\n" +
    "\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\tShift start time\n" +
    "\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t<select name=\"shiftStartTime\" class=\"timeslot post-ride-leaving-in\"  ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t.start for t in timeSlotJSON\"  ng-model=\"user.timeSlot\">\n" +
    "\t\t\t\t\t\t</select>\t\t\t\t\t\t\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div  class=\"error-msg-edit\" ng-messages=\"postRideForm.shiftStartTime.$error\">\n" +
    "\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">shift time is required</p>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"each-row\">\n" +
    "\t\t\t\t\t<div class=\"icon-address-fields\">\n" +
    "\t\t\t\t\t\t<img class=\"post-ride-from-icon\" src=\"assets/images/available-rides/starting-time.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"from-address-post-wrap\">\n" +
    "\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\tShift end time\n" +
    "\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t<select name=\"shiftEndTime\" class=\"timeslot post-ride-leaving-in\"  ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t.end for t in timeSlotJSON\"  ng-model=\"user.timeSlot\">\n" +
    "\t\t\t\t\t\t</select>\t\t\t\t\t\t\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div  class=\"error-msg-edit\" ng-messages=\"postRideForm.shiftEndTime.$error\">\n" +
    "\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">shift time is required</p>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"each-row post-ride-continue\" name=\"\" ng-click=\"saveDetails()\">\n" +
    "\t\t\t\tTAKE ME AHEAD... <img class=\"post-continue-img\" src=\"assets/images/icon_car.png\">\n" +
    "\t\t\t</div>\n" +
    "\t\t</form>\t\t\n" +
    "\t</div>\n" +
    "\n" +
    "\t<div class=\"home-menu-swiper-wrap\">\n" +
    "\t\t<div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\" >\n" +
    "\t\t\t<img src=\"assets/images/uparrow.png\" ng-click=\"toggleFooter()\" alt=\"up\">\n" +
    "\t\t</div>\n" +
    "\t\t<div class=\"home-page-menu-options\">\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"userHome.home\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/home.png\">\n" +
    "\t\t\t\t<p ui-sref=\"userHome.home\" class=\"home-menu-text\">HOME</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"userHome.userProfile\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/profile.png\">\n" +
    "\t\t\t\t<p ui-sref=\"userHome.userProfile\" class=\"home-menu-text\">PROFILE</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"userHome.rideStatus\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/track-ride.png\">\n" +
    "\t\t\t\t<p ui-sref=\"userHome.rideStatus\" class=\"home-menu-text\">TRACK RIDES</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"activities\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/history.png\">\n" +
    "\t\t\t\t<p ui-sref=\"activities\" class=\"home-menu-text\">HISTORY</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\t\n" +
    "</div>"
  );


  $templateCache.put('app/rideStatus/rideStatus.html',
    "<div class=page-wrapper><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Track my ride</span></div><form name=userProfileUpdateForm class=\"container login-container post-ride-container animation-form-signup ride-status\" novalidate><div class=triangle-down-left-post></div><div class=\"form-section signup-section-form post-ride-form\" ng-class=\"{'editable-mode' : editableMode}\"><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/from-icon.png ng-click=\"optionAddressOptions('from')\"></div><div id=postFromSec class=from-address-post-wrap><label class=\"field-label from\">From</label><span>{{postedRide.startLocation.display_address}}</span></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/to.png ng-click=\"optionAddressOptions('to')\"></div><div id=postToSec class=from-address-post-wrap><label class=\"field-label from\">To</label><span>{{postedRide.endLocation.display_address}}</span></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/via.png ng-click=\"optionAddressOptions('to')\"></div><div id=postToSec class=from-address-post-wrap><label class=\"field-label from\">Via</label><span>{{postedRide.routeSummary}}</span></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/starting-time.png></div><div class=user-input-section><!-- class=\"from-address-post-wrap\" --><label class=\"field-label from\">Leaving in</label><span class=non-editable-sec>{{rideScheduledTime}} minutes</span><div class=editable-sec><!-- <label class=\"field-label from\">Leaving In</label> --><select name=leavingIn class=\"timeslot post-ride-leaving-in\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t.value as t.text for t in leavingInJSON\" ng-model=leavingIn><option style=display:none value=\"\">Leaving In</option></select><div class=error-msg-edit ng-messages=postRideForm.shiftEndTime.$error><p ng-message=required class=error-msg>shift time is required</p></div></div></div></div><div class=each-row><div class=icon-address-fields><img class=post-ride-from-icon src=assets/images/available-rides/seats_avalaible.png></div><div class=from-address-post-wrap><label class=\"field-label from\">Seat Available</label><span>{{postedRide.currentlyAvailableSeats}} / {{postedRide.initiallyAvailableSeats}}</span></div></div></div><div class=\"each-row post-ride-continue\" name=syncData ui-sref=currentRide><!-- ng-click=\"startRide()\" -->START THE RIDE! <img class=post-continue-img src=assets/images/icon_car.png></div><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-L-none pad-R-none track-btn-sec\"><button class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pull-left track-reschedule-btn\" ng-click=leftButtonClicked(leftButtonText)>{{leftButtonText}}</button> <button class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pull-right track-reschedule-btn cancel-btn\" ng-click=rightButtonClicked(rightButtonText)>{{rightButtonText}}</button></div></form></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon ui-sref=userHome.rideStatus src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text ui-sref=userHome.rideStatus>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/startSampling/startSampling.html',
    "<div class=\"page-wrapper sampling-wrapper\"><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><span class=heading>Start Sampling</span></div><div class=\"container login-container\"><form name=userProfileUpdateForm class=animation-form-signup ng-submit=updateUserData() novalidate><div class=\"form-section signup-section-form\"><div class=each-row><input type=button class=input-buttons name=syncData value={{buttonText}} ng-click=startOrStopSampling(buttonText)></div></div></form><leaflet id=myMap defaults=defaults center=center paths=paths></leaflet></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/suggestions/suggestions.html',
    "<div class=\"page-wrapper suggestion-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Get Suggestions</span></div><div class=suggestion-map-wrap><!-- <div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none sugg-search-sec\">\n" +
    "\t\t\t\t<input type=\"text\" class=\"sugg-search-box\" placeholder=\"Search for co-commuters\" >\n" +
    "\t\t\t\t<img src=\"assets/images/3x/ico_search.png\" class=\"search-icon\">\n" +
    "\t\t\t</div> --><div class=\"triangle-down-left-post suggestion-page\"></div><p class=add-commuter-title>Tap to add co-commuters</p><leaflet markers=markers lf-center=center event-broadcast=events id=myMap defaults=defaults></leaflet><div class=sugg-create-team name=syncData ng-click=createTeam()>CREATE TEAM! <img class=post-continue-img src=assets/images/icon_car.png></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon ui-sref=userHome.rideStatus src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text ui-sref=userHome.rideStatus>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/teamDetails/teamActivities.html',
    "<div class=\"page-wrapper avail-page-wrapper\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section avail-ride-header\"><span class=heading>Activities</span> <img src=assets/images/info.svg class=\"pull-right act-info-icon cursor-pointer\"></div><div class=my-teams-wrapper><div class=triangle-down-left></div><div class=today-activity><p class=activity-header>Today</p><ul class=activity-list><li ng-repeat=\"activity in team.activities\"><span class=indic-circle></span> <span class=act-message>{{ activity.activity }}</span> <span class=act-time>{{ activity.activityTime }}</span></li></ul></div><!-- <div class=\"yesterday-activity\">\n" +
    "\t\t\t\t<p class=\"activity-header\">Yesterday</p>\n" +
    "\t\t\t\t<ul class=\"activity-list\">\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Siddharth is not commuting today</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t<li>\n" +
    "\t\t\t\t\t\t<span class=\"indic-circle\"></span>\n" +
    "\t\t\t\t\t\t<span class=\"act-message\">Jagdeep joined the commute</span>\n" +
    "\t\t\t\t\t\t<span class=\"act-time\">8:00 AM</span>\n" +
    "\t\t\t\t\t</li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</div> --></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/teamDetails/teamDetails.html',
    "<div class=\"page-wrapper avail-page-wrapper team-dtl-page\"><div class=\"container login-container user-home-container pad-R-none pad-L-none\" scroll ng-class={availheaderback:boolChangeClass}><div class=\"col-md-12 col-sm-12 col-xs-12 header-section avail-ride-header\"><!-- <span class=\"glyphicon glyphicon-chevron-left cursor-pointer pull-left\"></span> --><span class=heading>Team Details</span> <span class=\"glyphicon glyphicon-list-alt pull-right\" ng-click=getTeamActivities()></span></div><div class=team-dtl-wrapper><div class=triangle-down-left></div><p class=commute-title>{{ team.name }}</p><div class=team-detail-content><div class=\"each-row login-page\"><div class=field-icon-section><img class=icon-style src=assets/images/Locator.png></div><div class=user-input-section><p class=label-text>Starting</p><p class=value-text>{{ team.rideDetails.home.formatted_address }}</p></div></div><div class=\"each-row login-page\"><div class=field-icon-section><img class=icon-style src=assets/images/Locator.png></div><div class=user-input-section><p class=label-text>Destination</p><p class=value-text>{{ team.rideDetails.office.formatted_address }}</p></div></div><div class=\"each-row login-page\"><div class=field-icon-section><img class=\"icon-style time\" src=assets/images/time.png></div><div class=user-input-section><p class=label-text>Shift time</p><p class=value-text>{{ team.rideDetails.preferredTimeHToO }} - {{ team.rideDetails.preferredTimeOToH }}</p></div></div><p class=co-commuter-title>Co-commuters</p><ul class=co-comm-list><li class=owner><img src=assets/images/time.png> <span>{{ team.createdBy.empName }}</span></li><li ng-repeat=\"member in team.members\"><img src=assets/images/time.png> <span>{{ member.empName }}</span></li></ul></div></div></div><div class=home-menu-swiper-wrap><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\"><img src=assets/images/uparrow.png ng-click=toggleFooter() alt=up></div><div class=home-page-menu-options><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.home class=home-menu-icon src=assets/images/dashboard-icon/home.png><p ui-sref=userHome.home class=home-menu-text>HOME</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.userProfile class=home-menu-icon src=assets/images/dashboard-icon/profile.png><p ui-sref=userHome.userProfile class=home-menu-text>PROFILE</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=userHome.rideStatus class=home-menu-icon ui-sref=userHome.rideStatus src=assets/images/dashboard-icon/track-ride.png><p ui-sref=userHome.rideStatus class=home-menu-text ui-sref=userHome.rideStatus>TRACK RIDES</p></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\"><img ui-sref=activities class=home-menu-icon src=assets/images/dashboard-icon/history.png><p ui-sref=activities class=home-menu-text>HISTORY</p></div></div></div></div>"
  );


  $templateCache.put('app/userHome/userHome.html',
    "<div class=main-page-wrapper><!-- page content --><div class=main-content ng-class=\"{show : tgState}\"><ui-view></ui-view></div></div>"
  );


  $templateCache.put('app/userMarker/userMarker.html',
    "<div class=cn-wrapper id=cn-wrapper>{{contactno}} {{empid}}<ul><li><a ng-href=\"tel: {{contactno}}\"><img class=calling-icon-map src=assets/images/map-icons/icon_call.png></a></li><li><a href=#><img src=assets/images/map-icons/icon_contact_rollover.png></a></li><li><a href=#><img src=assets/images/map-icons/icon_favorite.png></a></li><li data-ng-click=onClick()><a><img class=add-icon-map src=assets/images/map-icons/icon_add.png></a></li></ul></div>"
  );


  $templateCache.put('app/userProfile/userProfile.html',
    "<div class=\"page-wrapper user-profile-wrapper\">\n" +
    "\t<div class=\"col-md-12 col-sm-12 col-xs-12 header-section post-ride-header\">\n" +
    "\t</div>\t\n" +
    "\t<div class=\"container profile-container\">\n" +
    "\t\t\n" +
    "\t\t<form name=\"userProfileUpdateForm\" class=\"animation-form-signup\" ng-submit=\"updateUserData()\" novalidate>\n" +
    "\t\t\t<div class=\"profile-pic-wrapper\">\n" +
    "\t\t\t\t<div class=\"triangle-down-left-post\"></div>\n" +
    "\t\t\t\t<!-- <img class=\"profile-pic\" src=\"assets/images/user-image.jpg\"> -->\n" +
    "\t\t\t\t<img class=\"profile-pic\" ng-src=\"{{ ride.offeredBy.userPhotoUrl || 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png' }}\" ng-click=\"getImageSaveContact()\">\n" +
    "\t\t\t\t<!-- <img class=\"profile-pic\" ng-src=\"data:image/png;base64,{{user.userPhotoUrl}}\" ng-click=\"getImageSaveContact()\"> -->\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"other-detail-wrapper\" ng-class=\"{'editable-mode' : editableMode}\">\n" +
    "\t\t\t\t<p class=\"profile-uname\"><span>{{user.empName}}</span></p>\n" +
    "\t\t\t\t\n" +
    "\n" +
    "\t\t\t\t<!-- Contact Number Section -->\n" +
    "\t\t\t\t<div class=\"profile-row\">\n" +
    "\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t<img class=\"icon-style home\" src=\"assets/images/icon_mobile_number.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.contactNo}}</span>\n" +
    "\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\tContact no.\n" +
    "\t\t\t\t\t\t\t</label> \n" +
    "\t\t\t\t\t\t\t<input maxlength=\"10\" class=\"form-control input-boxes login-input-box\"  ng-class=\"{'error-border':!showErrorMessage}\"  ng-model=\"user.contactNo\" type=\"tel\" name=\"contactNo\" required ng-pattern=\"/^[789]\\d{9}$/\" placeholder=\"Mobile Number\" >\n" +
    "\t\t\t\t\t\t\t<div ng-show=\"!showErrorMessage\"  ng-messages=\"signupForm.contactNo.$error\" class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Contact Number is required</p>\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"pattern\" class=\"error-msg\">Invalid Contact Number</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<!-- Home Address Section -->\n" +
    "\t\t\t\t<div class=\"profile-row\" ng-show=\"user.homeAddressLocation != null\">\n" +
    "\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t<img class=\"icon-style home\" alt=\"Home\" src=\"assets/images/available-rides/from-icon.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.homeAddressLocation.display_address}}, {{user.city}}, {{user.state}}</span>\n" +
    "\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\tHome address\n" +
    "\t\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t\t<input tab-index=\"1\" id=\"\" ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\" type=\"text\" name=\"homeAddress\" required ng-model='user.homeAddress' g-places-autocomplete options=\"autocompleteOptions\">\n" +
    "\t\t\t                <div  class=\"error-msg-edit\" ng-messages=\"postRideForm.homeAddress.$error\">\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Home address is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t<div class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t\t\t<span class=\"error-msg\" style\"color: red;\" ng-show=\"userProfileUpdateForm.homeAddress.$error.useautocomplete\">Please use autocomplete to select Home address</span>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<!-- Office Address Section -->\n" +
    "\t\t\t\t<div class=\"profile-row\" ng-show=\"user.officeAddressLocation != null\">\n" +
    "\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t<img class=\"icon-style home\" alt=\"Home\" src=\"assets/images/available-rides/to.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.officeAddressLocation.display_address}}, {{user.city}}, {{user.state}}</span>\n" +
    "\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\tOffice address\n" +
    "\t\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t\t<select ng-options='item as item.display_address for item in officeAddressJSON' ng-model='officeAddress' name='officeAddress' class=\"post-ofc-address\">\n" +
    "\t\t\t\t\t\t\t\t<option style=\"display:none\" value=\"\">Office Address</option> \n" +
    "\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t                <div  class=\"error-msg-edit\" ng-messages=\"postRideForm.officeAddress.$error\">\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Office address is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<!-- vehicleLicenseNumber section -->\n" +
    "\t\t\t\t<div class=\"profile-row\" ng-show=\"user.vehicle[0] != null\">\n" +
    "\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t<img class=\"icon-style home\" alt=\"Home\" src=\"assets/images/car-front.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.vehicle[0].vehicleLicenseNumber}}</span>\n" +
    "\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\tVehicle no.\n" +
    "\t\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t\t<input class=\"form-control input-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" type=\"text\" maxlength=\"13\" name=\"vehicleNo\" required ng-pattern=\"/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/\" ng-model=\"user.vehicle[0].vehicleLicenseNumber\">\n" +
    "\t\t\t                <div ng-show=\"!showErrorMessage\"  ng-messages=\"signupForm.vehicleNo.$error\" class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Registration Number is required</p>\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"pattern\" class=\"error-msg\">Invalid Registration Number</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<!-- Seats Available Section -->\n" +
    "\t\t\t\t<div class=\"profile-row\" ng-show=\"user.vehicle[0] != null\">\n" +
    "\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t<img class=\"icon-style home\" alt=\"Home\" src=\"assets/images/available-rides/to.png\">\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.vehicle[0].capacity}}</span>\n" +
    "\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\tSeats available\n" +
    "\t\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t\t<select class=\"timeslot post-ride-leaving-in\" name=\"availableSeats\" ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=\"vehicleCapacity\" ng-options=\"c as c for c in vehicleCapacityJSON\">\n" +
    "\t\t\t\t\t\t\t\t<option style=\"display:none\" value=\"\">Seats available</option>\n" +
    "\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t<div ng-show=\"!showErrorMessage\"  ng-messages=\"postRideForm.availableSeats.$error\" class=\"error-msg-edit\">\n" +
    "\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">Available seats is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\t\t\t\t<!-- Shift Timings Sections -->\n" +
    "\t\t\t\t<div class=\"profile-row timing\" ng-show=\"user.shiftTimeIn != null\">\n" +
    "\n" +
    "\n" +
    "\t\t\t\t\t<!-- Shift TimeIn Section -->\n" +
    "\t\t\t\t\t<div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pad-L-none\">\n" +
    "\t\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t\t<img class=\"icon-style home\" alt=\"Home\" src=\"assets/images/available-rides/starting-time.png\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.shiftTimeIn | date:'hh:mm a'}}</span>\n" +
    "\t\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\t\tShift start time\n" +
    "\t\t\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t\t\t<select name=\"shiftStartTime\" class=\"timeslot post-ride-leaving-in\"  ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t.start for t in timeSlotJSON\"  ng-model=\"shiftTime\">\n" +
    "\t\t\t\t\t\t\t\t\t<option style=\"display:none\" value=\"\">Shift start time</option> \t\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<div  class=\"error-msg-edit\" ng-messages=\"postRideForm.shiftStartTime.$error\">\n" +
    "\t\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">shift time is required</p>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\t\t\t\t\t<!-- Shift TimeOut Section -->\n" +
    "\t\t\t\t\t<div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 pad-R-none\">\n" +
    "\t\t\t\t\t\t<div class=\"field-icon-section\">\n" +
    "\t\t\t\t\t\t\t<img class=\"icon-style home\" alt=\"Home\" src=\"assets/images/available-rides/starting-time.png\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\n" +
    "\t\t\t\t\t\t<div class=\"user-input-section\">\n" +
    "\t\t\t\t\t\t\t<span class=\"non-editable-sec\">{{user.shiftTimeout | date:'hh:mm a'}}</span>\n" +
    "\t\t\t\t\t\t\t<div class=\"editable-sec\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"field-label from\">\n" +
    "\t\t\t\t\t\t\t\t\tShift end time\n" +
    "\t\t\t\t\t\t\t\t</label>\n" +
    "\t\t\t\t\t\t\t\t<select name=\"shiftEndTime\" class=\"timeslot post-ride-leaving-in\"  ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t.end for t in timeSlotJSON\"  ng-model=\"shiftTime\">\n" +
    "\t\t\t\t\t\t\t\t\t<option style=\"display:none\" value=\"\">Shift end time</option> \t\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<div  class=\"error-msg-edit\" ng-messages=\"postRideForm.shiftEndTime.$error\">\n" +
    "\t\t\t\t\t\t\t\t\t<p ng-message=\"required\" class=\"error-msg\">shift time is required</p>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t<div class=\"prof-edit-btn\" ng-click=\"operation(leftButtonText)\">\n" +
    "\t\t\t\t\t{{leftButtonText}} <img class=\"prof-btn-img\" src=\"assets/images/icon_car.png\">\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"prof-logout-btn\" ng-click=\"operation(rightButtonText)\">\n" +
    "\t\t\t\t\t{{rightButtonText}} <img class=\"prof-btn-img\" src=\"assets/images/icon_car_grey.png\">\n" +
    "\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t</div>\n" +
    "\t\t</form>\t\t\n" +
    "\t</div>\n" +
    "\n" +
    "\t<div class=\"home-menu-swiper-wrap\">\n" +
    "\t\t<div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 slide-arrow-sec\" >\n" +
    "\t\t\t<img src=\"assets/images/uparrow.png\" ng-click=\"toggleFooter()\" alt=\"up\">\n" +
    "\t\t</div>\n" +
    "\t\t<div class=\"home-page-menu-options\">\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"userHome.home\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/home.png\">\n" +
    "\t\t\t\t<p ui-sref=\"userHome.home\" class=\"home-menu-text\">HOME</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"userHome.userProfile\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/profile.png\">\n" +
    "\t\t\t\t<p ui-sref=\"userHome.userProfile\" class=\"home-menu-text\">PROFILE</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"userHome.rideStatus\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/track-ride.png\">\n" +
    "\t\t\t\t<p ui-sref=\"userHome.rideStatus\" class=\"home-menu-text\">TRACK RIDES</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 each-home-menu\">\n" +
    "\t\t\t\t<img ui-sref=\"activities\" class=\"home-menu-icon\" src=\"assets/images/dashboard-icon/history.png\">\n" +
    "\t\t\t\t<p ui-sref=\"activities\" class=\"home-menu-text\">HISTORY</p>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\t\n" +
    "</div>"
  );


  $templateCache.put('components/modal/modal.html',
    "<!-- <div class=\"modal-header\">\n" +
    "  <button ng-if=\"modal.dismissable\" type=\"button\" ng-click=\"$dismiss()\" class=\"close\">&times;</button>\n" +
    "  <h4 ng-if=\"modal.title\" ng-bind=\"modal.title\" class=\"modal-title\"></h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <p ng-if=\"modal.text\" ng-bind=\"modal.text\"></p>\n" +
    "  <div ng-if=\"modal.html\" ng-bind-html=\"modal.html\"></div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button ng-repeat=\"button in modal.buttons\" ng-class=\"button.classes\" ng-click=\"button.click($event)\" ng-bind=\"button.text\" class=\"btn\"></button>\n" +
    "</div> --><div class=modal-header><!--    <h3 class=\"modal-title\">I'm a modal!</h3> --></div><div class=modal-body><p>Please make sure that you click this icon at exact home location, otherwise suggestions will be inaccurate.</p></div><div class=modal-footer><button class=\"btn btn-primary\" type=button ng-click=homeAddressModalOk()>OK</button> <button class=\"btn btn-warning\" type=button ng-click=homeAddressModalCancel()>Cancel</button></div>"
  );


  $templateCache.put('components/navbar/navbar.html',
    "<div class=\"navbar navbar-default navbar-static-top\" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click=\"isCollapsed = !isCollapsed\"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href=\"/\" class=navbar-brand>cb</a></div><div collapse=isCollapsed class=\"navbar-collapse collapse\" id=navbar-main><ul class=\"nav navbar-nav\"><li ng-repeat=\"item in menu\" ng-class=\"{active: isActive(item.link)}\"><a ng-href={{item.link}}>{{item.title}}</a></li><li ng-show=isAdmin() ng-class=\"{active: isActive('/admin')}\"><a href=/admin>Admin</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li ng-hide=isLoggedIn() ng-class=\"{active: isActive('/signup')}\"><a ui-sref=signup.stepOne>Sign up</a></li><li ng-hide=isLoggedIn() ng-class=\"{active: isActive('/login')}\"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text>Hello {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-class=\"{active: isActive('/settings')}\"><a href=/settings><span class=\"glyphicon glyphicon-cog\"></span></a></li><li ng-show=isLoggedIn() ng-class=\"{active: isActive('/logout')}\"><a href=\"\" ng-click=logout()>Logout</a></li></ul></div></div></div>"
  );

}]);

