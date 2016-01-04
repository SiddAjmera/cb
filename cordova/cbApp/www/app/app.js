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
  'ngCordova'
])
  .config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider", function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
     console.log("In config block");

    $urlRouterProvider
      .otherwise('/');

  //  $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

  }])

  .factory('authInterceptor', ["$rootScope", "$q", "$location", "localStorage", function ($rootScope, $q,$location,localStorage) {
    return {
      // Add authorization token to headers
      request: function (config) {
        var deferred = $q.defer();

        config.headers = config.headers || {};
        localStorage.retrieve('token').
        then(function(res){
          console.log("header",res);
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
          $location.path('/login');
          // remove any stale tokens
          localStorage.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  }])

  .run(["$rootScope", "$location", "Auth", "localStorage", "$state", function ($rootScope, $location, Auth,localStorage,$state) {
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
               $location.path('/userHome/home');
            else{
              localStorage.initialize();
              //$location.path('/intro');
            }
         });
        }

      });
    });
  }]);

var onDeviceReady = function() {
    angular.bootstrap( document, ['cbApp']);
    $.getScript('http://maps.google.com/maps/api/js?sensor=false');
}
document.addEventListener('deviceready', 
onDeviceReady);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        abstract: true,
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  }]);
'use strict';

angular.module('cbApp')
  .controller('LoginCtrl', ["$scope", "Auth", "$location", "$window", "$state", function ($scope, Auth, $location, $window,$state) {
    $scope.user = {};
    $scope.loginForm = {};
    $scope.showErrorMessage = false;
    $scope.login = function() {
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
          empId: $scope.user.empId,
          password: $scope.user.password
        })
        .then(function(response) {
          console.log(response)
          // Logged in, redirect to home
          $state.go('userHome.home');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);

'use strict';

angular.module('cbApp')
  .controller('SettingsCtrl', ["$scope", "User", "Auth", function ($scope, User, Auth) {
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
  }]);

'use strict';

angular.module('cbApp')
  .controller('SignupCtrl', ["$scope", "Auth", "$location", "$window", "parse", "$state", "$http", "$modal", "cordovaUtil", "httpRequest", "localStorage", function ($scope, Auth, $location, $window,parse,$state, $http,$modal,cordovaUtil,httpRequest,localStorage) {
    $scope.user = {vehicle:{}};
    $scope.user.gender = "Female";
    $scope.timeSlotJSON = ["8:00 AM - 5:00 PM",
                                "9:00 AM - 6:00 PM",
                                "10:00 AM - 7:00 PM",
                                "11:00 AM - 8:00 PM",
                                "12:00 AM - 9:00 PM"
                               ];

    $scope.officeAddressJSON = ["BIRLA AT&T, PUNE",
                                "BT TechM Collocation",
                                "Bhosari MIDC Non STP",
                                "Bhosari MIDC STP",
                                "CMC-Pune",
                                "CRL - Hinjewadi",
                                "Cerebrum IT Park",
                                "KIRLOSKAR",
                                "Millenium Bldg, Pune",
                                "NAVLAKHA COMP.-PUNE",
                                "Nashik Centre NSTP",
                                "Nashik PSK Sites",
                                "Nyati Tiara",
                                "Pune - Commerzone",
                                "Pune PSK Sites",
                                "Pune Sahyadri Park",
                                "Pune(QuadraII) STP",
                                "Pune(QuadraII)NonSTP",
                                "Pune-Sun Suzlon-NSTP",
                                "QBPL -Pune SEZ",
                                "SP - A1 - Rajgad",
                                "SP - S1 - Poorna",
                                "SP - S2 - Torna",
                                "SP - S3 - Tikona",
                                "SahyadriPark SEZ - I",
                                "Sp-S1-Poorna-BPO",
                                "Sp-S2-Torna-BPO",
                                "TRDDC HADAPSAR, PUNE",
                                "VSNL - Pune"
                               ];

    $scope.vehicleCapacityJSON = ["2","3","4","5","6"];
    $scope.showErrorMessage = true;
    var currentStep = 1;
   
    $scope.signupForm = {};
    
    //by default, or on page refresh, redirect to first step.
    $scope.step = 1;
    $state.go("signup.stepOne");


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
         
         if(!$scope.signupForm.$valid){   /*if form is invalid,return and show error messages */
              console.log($scope.signupForm) ;
              $("input.ng-invalid").eq(0).focus();      
              console.log("----------",$("input.ng-invalid"))
              return false;
         } 

        /*else save the data*/
    
        // Function to save the UserObject in MongoDB
        var url = config.apis.signup;
        httpRequest.post(url,$scope.user).
        then(function(response){
              /*if(response.status==)*/
              if(response.status==200){
                 console.log('User Stored in the MongoDB Successfully. Here is the Response : ',response);
                  //$scope.response = response;
                  localStorage.store('token',response.data.token).then(function(){
                      $state.go("userHome.home");
              })
              }
             
            
        },function(err){
             console.log('Error Storing the User to the MongoDB. Here is the Error: ' + err);
             $scope.error = err;
        });
       


    };

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
            $scope.user.zipcode = address.zipcode;
            $scope.user.placeID = address.placeID;
            $scope.user.homelocationCoordinates = [];
            $scope.user.homelocationCoordinates.push(address.homeLocationCoordinates.lat);
            $scope.user.homelocationCoordinates.push(address.homeLocationCoordinates.lng);
            $scope.user.state = address.state;
          });
        });
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);

'use strict';

angular.module('cbApp')
  .controller('StepOneCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('signup.stepOne', {
        url: '/stepOne',
        templateUrl: 'app/account/signup/stepOne/stepOne.html'
      });
  }]);

'use strict';

angular.module('cbApp')
  .controller('StepThreeCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('signup.stepThree', {
        url: '/stepThree',
        templateUrl: 'app/account/signup/stepThree/stepThree.html'
      });
  }]);

'use strict';

angular.module('cbApp')
  .controller('StepTwoCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('signup.stepTwo', {
        url: '/stepTwo',
        templateUrl: 'app/account/signup/stepTwo/stepTwo.html'
      });
  }]);

'use strict';

angular.module('cbApp')
  .controller('AdminCtrl', ["$scope", "$http", "Auth", "User", function ($scope, $http, Auth, User) {

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
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  }]);
'use strict';

angular.module('cbApp')
  .controller('AvailableRidesCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome.availableRides', {
        url: '/availableRides',
        templateUrl: 'app/availableRides/availableRides.html',
        controller: 'AvailableRidesCtrl'
      });
  }]);

if(angular.isUndefined(config)){
	var config={};
	config.apis={};
}


//base URL for API
//config.apiBaseURL="http://localhost:9000/";
config.apiBaseURL="http://52.77.218.140:9000/";

/*apis start from here*/

config.apis.login = "auth/local";
config.apis.syncLocations = "api/locations";
config.apis.signup = "api/users/"

config.apis.getAllUsers = "api/users/"
config.cordova=true;
'use strict';

angular.module('cbApp')
  .service('cordovaInit', ["$document", "$q", function($document, $q) {

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
	}]);

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

'use strict';

angular.module('cbApp')
  .controller('HomeCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome.home', {
        url: '/home',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'

      });
  }]);

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
            var qs=queryString.stringify(params);
            req.url = config.apiBaseURL+url+"?"+qs;
          }
          else{
              req.url = config.apiBaseURL+url;
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
        }
    }
   }
  ]);
'use strict';

angular.module('cbApp')
  .controller('IntroCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('intro', {
        url: '/intro',
        templateUrl: 'app/intro/intro.html',
        controller: 'IntroCtrl'
      });
  }]);
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
                        console.log("item",item);
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
  .controller('MainCtrl', ["$scope", "$http", "socket", "cordovaUtil", "$state", "localStorage", function ($scope, $http, socket, cordovaUtil, $state, localStorage) {

   
	  
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
      console.log("Syncing")
      cordovaUtil.batchSync();
    }

    $scope.openSignupForm = function(){
      $state.go('signup.stepOne');
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
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  }]);
'use strict';

angular.module('cbApp')
  .controller('MapCtrl', ["$scope", "cordovaUtil", function ($scope,cordovaUtil) {
     $scope.startTracking=function(){
		  
		  cordovaUtil.getCoordinates();
	  }

	  
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('map', {
        url: '/map',
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  }]);

'use strict';

angular.module('cbApp')
  .service('parse', ["$q", function ($q) {
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
  }]);

'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', ["$scope", function ($scope) {
    $scope.message = 'Hello';

    $scope.leavingInJSON = ["5 MIN.",
                                "10 MIN.",
                                "15 MIN.",
                                "20 MIN.",
                                "25 MIN.",
                                "30 MIN.",
                                "35 MIN.",
                                "40 MIN.",
                                "45 MIN.",
                                "50 MIN.",
                                "55 MIN.",
                                "60 MIN."
                          	];

    $scope.availableSeatsJSON = ["1",
    						 "2",
    						 "3",
    						 "4",
    						 "5",
    						 "6"
    						];
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome.postRides', {
        url: '/postRides',
        templateUrl: 'app/postRides/postRides.html',
        controller: 'PostRidesCtrl'
      });
  }]);

'use strict';

angular.module('cbApp')
  .controller('StartSamplingCtrl', ["$scope", "cordovaUtil", "$rootScope", "localStorage", function ($scope, cordovaUtil,$rootScope,localStorage) {
    $scope.message = 'Hello';
    $scope.buttonText="START SAMPLING";

     $scope.defaults={minZoom:10, maxZoom:20,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
  $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };
    $scope.setCenter=true;
$scope.paths={};
    $scope.startOrStopSampling = function(value){
    	if(value == "START SAMPLING"){
    		$scope.buttonText="STOP SAMPLING";
            if(config.cordova)
            cordova.plugins.backgroundMode.enable();
    		cordovaUtil.getCoordinates();
    	}
    	else{
    		$scope.buttonText="START SAMPLING";
             if(config.cordova)
            cordova.plugins.backgroundMode.disable();
    		cordovaUtil.stopSampling();
    	}
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
                var filteredData=$scope.filterData($scope.GDouglasPeucker(pathArr,20),0.5);
               console.log(filteredData )
                $scope.paths={
                     p1: {
                color: '#008000',
                weight: 8,
                latlngs:filteredData
                }

               }
           }
            }) 
    });
    $scope.filterData=function(pathArr,threshold){
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
    }
    $scope.GDouglasPeucker=function(source, kink)
/* source[] Input coordinates in GLatLngs 	*/
/* kink	in metres, kinks above this depth kept  */
/* kink depth is the height of the triangle abc where a-b and b-c are two consecutive line segments */
{
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
}]);
'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome.startSampling', {
        url: '/startSampling',
        templateUrl: 'app/startSampling/startSampling.html',
        controller: 'StartSamplingCtrl'
      });
  }]);
'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', ["$scope", "leafletMarkerEvents", "$timeout", "httpRequest", "User", function ($scope, leafletMarkerEvents, $timeout,httpRequest,User) {
     User.get().$promise
    .then(function(userData){
      $scope.currentUser=userData;
      console.log($scope.currentUser);
    });
   $scope.defaults={minZoom:10, maxZoom:15,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
     $scope.markers= [];
    var getAllSuggestions = function(){
        httpRequest.get(config.apis.getAllUsers).
        then(function(res){
            console.log("res",res);
            if(res.status==200){
                $scope.suggestedUsers = res.data;

                angular.forEach($scope.suggestedUsers, function(user, key){
                        var tempObj = {};
                        tempObj.lat = parseFloat(user.homeLocationCoordinates[0]);
                        tempObj.lng = parseFloat(user.homeLocationCoordinates[1]);
                        tempObj.enable=['click','touch'];
                        var markerClass ="";
                        if($scope.currentUser.empId == user.empId)
                            markerClass = "map-user-marker user-own";
                        else
                             markerClass = "map-user-marker";
                        var image = angular.element('<img>',{src:user.userPhotoUrl,'class':markerClass});
                        var p = angular.element('<p>',{'class':'map-user-name-sec','html':user.empName});
                        console.log(image.outerHTML )
                        /*tempObj.layer="Options";*/
                        tempObj.icon= {
                                            type: 'div',
                                            iconSize: [25, 60],
                                            popupAnchor:  [0, -50],
                                            iconAnchor:   [10, 45],
                                            html: image[0].outerHTML+p[0].outerHTML  
                                     }
                        tempObj.message='<user-marker contactno="'+user.contactNo+'"></user-marker';
                        $scope.markers.push(tempObj)
                });
                console.log($scope.markers)
            }
        })
    }    

    getAllSuggestions();

   
    $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
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


    
  }]);
'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome.suggestions', {
        url: '/suggestions',
        templateUrl: 'app/suggestions/suggestions.html',
        controller: 'SuggestionsCtrl'
      });
  }]);
'use strict';

angular.module('cbApp')
  .controller('UserHomeCtrl', ["$scope", "Auth", "$state", "User", function ($scope,Auth,$state,User) {
    $scope.message = 'Hello';
    $scope.tgState = false;
    User.get().$promise
    .then(function(userData){
      $scope.currentUser=userData;
      console.log($scope.currentUser);
    });
    

    $scope.toggleHamburger = function(){
    	$scope.tgState = !$scope.tgState;
    }

    $scope.logout = function(){
    	Auth.logout();
      $state.go("login")
    }
  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome', {
        url: '/userHome',
        templateUrl: 'app/userHome/userHome.html',
        controller: 'UserHomeCtrl'
      });
  }]);

'use strict';

angular.module('cbApp')
  .directive('userMarker', function () {
    return {
      templateUrl: 'app/userMarker/userMarker.html',
      restrict: 'E',
      scope:{
      	contactno:"="
      },
      link: function (scope, element, attrs) {
      	console.log(scope.contactno);
      	scope.callMe = function(){
      		alert("directive function called!")
      	}
      }
    };
  });

'use strict';

angular.module('cbApp')
  .controller('UserProfileCtrl', ["$scope", "$modal", "cordovaUtil", "$cordovaImagePicker", function ($scope, $modal, cordovaUtil,$cordovaImagePicker) {
    $scope.message = 'Hello';


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
          	alert('Promise was returned successfully. Address is : ' + address);
           	$scope.user.homeAddress=address.homeAddress;
            $scope.user.city=address.city;
            $scope.user.zipcode=address.zipcode;
            $scope.user.placeID=address.placeID;
          })
        });
    };
    
    
    $scope.getImageSaveContact = function() {       
            // Image picker will load images according to these settings
            var options = {
                maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                width: 800,
                height: 800,
                quality: 80            // Higher is better
            };
 
            $cordovaImagePicker.getPictures(options).then(function (results) {
                // Loop through acquired images
                for (var i = 0; i < results.length; i++) {
                    $scope.selectedImage = results[i];   // We loading only one image so we can use it like this
 
                    window.plugins.Base64.encodeFile($scope.selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                        $scope.selectedImage = base64;
                        console.log($scope.selectedImage)
                    });
                }
            }, function(error) {
                console.log('Error: ' + JSON.stringify(error));    // In case of error
            });
        };

    $scope.syncUserLocationData = function(){
    	cordovaUtil.syncCoordinates();
    };

  }]);

'use strict';

angular.module('cbApp')
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('userHome.userProfile', {
        url: '/userProfile',
        templateUrl: 'app/userProfile/userProfile.html',
        controller: 'UserProfileCtrl'
      });
  }]);
'use strict';

angular.module('cbApp')
  .factory('Auth', ["$location", "$rootScope", "User", "$q", "httpRequest", "localStorage", function Auth($location, $rootScope, User,$q,httpRequest,localStorage) {
    var currentUser = {};

  localStorage.retrieve('token').
    then(function(res){
      if(res!=null)
         currentUser = User.get();
        console.log(currentUser)
    });
   // if($cookieStore.get('token')) {
   //    currentUser = User.get();
   //  }

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
        tempUser.userId = user.empId;
        tempUser.password = user.password;
        httpRequest.post(config.apis.login,tempUser).
        then(function(data){
          if(data.status==200){
            localStorage.store('token',data.data.token).
             /*$localForage.setItem('token', data.data.token).*/
             then(function(){
                currentUser = User.get();
                console.log("currentUser",currentUser)
                deferred.resolve(data);
                return cb();
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
      getCurrentUser: function() {
        return currentUser;
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
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
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
  }]);

'use strict';

angular.module('cbApp')
  .factory('User', ["$resource", function ($resource) {
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
  }]);

'use strict';

angular.module('cbApp')
  .controller('ModalCtrl', ["$scope", "$modalInstance", function ($scope, $modalInstance) {
    $scope.message = 'Hello';

    $scope.homeAddressModalOk = function(){
 
    //	cordovaUtil.getUserHomeCoordinates();
    	$modalInstance.close('yes');
    };

    $scope.homeAddressModalCancel = function(){
    	
    	$modalInstance.close();
    };


  }]);
'use strict';

angular.module('cbApp')
  .factory('Modal', ["$rootScope", "$modal", function ($rootScope, $modal) {
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
  }]);

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
  .controller('NavbarCtrl', ["$scope", "$location", "Auth", function ($scope, $location, Auth) {
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
  }]);
/* global io */
'use strict';

angular.module('cbApp')
  .factory('socket', ["socketFactory", function(socketFactory) {

    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io('', {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
      path: '/socket.io-client'
    });

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

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

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
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }
    };
  }]);

angular.module('cbApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/account/login/login.html',
    "<!-- Login by Siddharth Ajmera --><div class=\"page-wrapper login-wrapper\"><div class=\"container login-container\"><div class=form-section><form class=form name=loginForm novalidate><div class=\"each-row login-page\"><div><span><img class=icon-style src=assets/images/icon_username.png></span></div><div><input ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control input-boxes login-input-box\" name=empId placeholder=\"EMPLOYEE ID\" ng-model=user.empId required ng-pattern=\"/^[0-9]*$/\"><div ng-show=showErrorMessage ng-messages=loginForm.empId.$error class=error-msg-edit><p ng-message=required class=error-msg>Please enter Employee number</p><p ng-message=pattern class=error-msg>Please enter valid Employee number</p></div></div></div><div class=\"each-row login-page\"><div><span><img class=icon-style src=assets/images/icon_password.png></span></div><div><input ng-class=\"{'error-border':showErrorMessage}\" class=\"form-control pwd-boxes login-input-box\" type=password name=password placeholder=PASSWORD ng-model=user.password required><div ng-show=showErrorMessage ng-messages=loginForm.password.$error class=error-msg-edit><p ng-message=required class=error-msg>Please enter password</p></div></div></div><div class=\"each-row login-page\"><input type=button name=continue value=LOGIN ng-click=login()></div></form><a>Forgot password?</a> <a ui-sref=signup.stepOne>Register</a></div></div></div>"
  );


  $templateCache.put('app/account/settings/settings.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show=\"(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)\">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class=\"btn btn-lg btn-primary\" type=submit>Save changes</button></form></div></div></div>"
  );


  $templateCache.put('app/account/signup/signup.html',
    "<div class=page-wrapper><div class=\"container login-container\"><div class=timeline-section><!-- progressbar --><ul id=progressbar><li ng-class=\"{'active':step==1}\" ng-click=goToStep(1)><a href=\"\">1</a></li><li ng-class=\"{'active':step==2}\" ng-click=goToStep(2)><a href=\"\">2</a></li><li ng-class=\"{'active':step==3}\" ng-click=goToStep(3)><a href=\"\">3</a></li></ul></div><form name=signupForm class=animation-form-signup ng-submit=register() novalidate><div ui-view></div></form></div></div>"
  );


  $templateCache.put('app/account/signup/stepOne/stepOne.html',
    "<div class=\"form-section signup-section-form\"><div class=each-row><div><span><img class=icon-style src=assets/images/icon_employee_ID.png></span></div><div><input type=number max=9999999 ng-class=\"{'error-border':!showErrorMessage}\" class=\"form-control input-boxes login-input-box\" ng-model=user.empId name=empid placeholder=\"EMPLOYEE ID\" required ng-pattern=\"/^[1-9]\\d*$/\"><div ng-show=!showErrorMessage ng-messages=signupForm.empid.$error class=error-msg-edit><p ng-message=required class=error-msg>Employee ID is required</p><p ng-message=pattern class=error-msg>Invalid Employee ID</p></div></div></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_username.png></span></div><div><input ng-class=\"{'error-border':!showErrorMessage}\" name=empName class=\"form-control input-boxes login-input-box\" ng-model=user.empName placeholder=NAME required><div ng-show=!showErrorMessage ng-messages=signupForm.empName.$error class=error-msg-edit><p ng-message=required class=error-msg>Name is required</p><p ng-message=pattern class=error-msg>Invalid Name</p></div></div></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_mobile_number.png></span></div><div><input maxlength=10 class=\"form-control input-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" ng-model=user.contactNo type=tel name=contactNo required ng-pattern=\"/^[789]\\d{9}$/\" placeholder=\"MOBILE NUMBER\"><div ng-show=!showErrorMessage ng-messages=signupForm.contactNo.$error class=error-msg-edit><p ng-message=required class=error-msg>Contact Number is required</p><p ng-message=pattern class=error-msg>Invalid Contact Number</p></div></div></div><div id=sites class=\"each-row gender-section\"><div class=\"radio gender-radio\"><label class=rad><input type=radio name=optradio value=Female ng-model=\"user.gender\"><i></i> FEMALE</label></div><div class=\"radio gender-radio\"><label class=rad><input type=radio name=optradio value=Male ng-model=\"user.gender\"><i></i> MALE</label></div></div><div class=each-row><input type=button class=input-buttons name=continue value=CONTINUE ng-click=goToStep(2)></div></div>"
  );


  $templateCache.put('app/account/signup/stepThree/stepThree.html',
    "<div class=\"form-section signup-section-form\"><div class=each-row><div><span><img class=icon-style src=assets/images/icon_username.png></span></div><div><input type=number maxlength=9999999 ng-class=\"{'error-border':!showErrorMessage}\" class=\"form-control input-boxes login-input-box\" ng-model=user.username name=username placeholder=USERNAME required ng-pattern=\"/^[1-9]\\d*$/\"><div ng-show=!showErrorMessage ng-messages=signupForm.username.$error class=error-msg-edit><p ng-message=required class=error-msg>Username is required</p><p ng-message=pattern class=error-msg>Invalid Username</p></div></div></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_password.png></span></div><div><input class=\"form-control pwd-boxes login-input-box\" ng-class=\"{'error-border':!showErrorMessage}\" required type=password ng-model=user.password name=password placeholder=PASSWORD><div ng-show=!showErrorMessage ng-messages=signupForm.password.$error class=error-msg-edit><p ng-message=required class=error-msg>Please enter password</p></div></div></div><div class=each-row><p class=terms-cond-text>By Signing up, I agree to TCS's <a href=# class=\"global-link float-none\">Terms of Service</a> and <a href=# class=\"global-link float-none\">Privacy Policy</a></p></div><div class=each-row><input type=submit class=submit-buttons name=continue value=REGISTER></div></div>"
  );


  $templateCache.put('app/account/signup/stepTwo/stepTwo.html',
    "<div class=\"form-section signup-section-form signup-two-wrap\"><div class=each-row><div><span><img class=icon-style src=assets/images/icon_home_address.png></span></div><div class=\"input-fields address-fields\"><input ng-class=\"{'error-border':!showErrorMessage}\" name=homeAddress class=\"form-control input-boxes\" ng-model=user.homeAddress placeholder=\"HOME ADDRESS\" required></div><div class=icon-address-fields><span><img class=icon-style src=assets/images/icon_location.png ng-click=getLocation()></span></div><div ng-show=!showErrorMessage ng-messages=signupForm.homeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Home Address is required</p></div></div><div class=each-row><span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_city.png></span></div><div class=input-fields><input ng-class=\"{'error-border':!showErrorMessage}\" name=city class=\"form-control input-boxes login-input-box\" ng-model=user.city placeholder=CITY required ng-pattern=\"/^[a-zA-Z]+(?:[\\s-][a-zA-Z]+)*$/\"></div><div ng-show=!showErrorMessage ng-messages=signupForm.city.$error class=error-msg-edit><p ng-message=required class=error-msg>City is required</p><p ng-message=pattern class=error-msg>Invalid City</p></div></span> <span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_zipcode.png></span></div><div class=input-fields><input type=number ng-class=\"{'error-border':!showErrorMessage}\" name=zipcode class=\"form-control input-boxes login-input-box\" ng-model=user.zipcode placeholder=ZIPCODE max=999999 required ng-pattern=\"/^[123456789]\\d{5}$/\"></div><div ng-show=!showErrorMessage ng-messages=signupForm.homeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Zipcode is required</p><p ng-message=pattern class=error-msg>Invalid Zipcode</p></div></span></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_office_address.png></span></div><div class=\"input-fields office-address-select-wrap\"><!-- <select ui-select2  name=\"officeAddress\" class=\"office-address-select\" ng-model=\"user.officeAddress\" ng-class=\"{'error-border':!showErrorMessage}\" required  data-placeholder=\"OFFICE ADDRESS\">\n" +
    "\t\t\t\t\t<option value=\"\">OFFICE ADDRESS</option>\n" +
    "\t\t\t\t <option ng-repeat=\"oa in officeAddressJSON\" value=\"{{oa}}\">{{oa}}</option>   \n" +
    "\t\t\t</select> --><ui-select ng-model=user.officeAddress class=office-address-select><ui-select-match placeholder=\"OFFICE ADDRESS\"><span ng-bind=$select.selected></span></ui-select-match><ui-select-choices repeat=\"item in (officeAddressJSON | filter: $select.search)\"><span ng-bind=item></span></ui-select-choices></ui-select></div><div ng-show=!showErrorMessage ng-messages=signupForm.officeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Please select an office address</p></div></div><div class=each-row><span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_time.png></span></div><div class=input-fields><select name=timeSlot class=\"timeslot login-input-box\" ng-model=user.timeSlot ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t for t in timeSlotJSON\"><option style=display:none value=\"\">TIMESLOT</option></select></div><div ng-show=!showErrorMessage ng-messages=signupForm.timeSlot.$error class=error-msg-edit><p ng-message=required class=error-msg>Please select a timeslot</p></div></span> <span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_seat.png></span></div><div class=input-fields><select class=\"seater-select login-input-box\" name=capacity ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=user.vehicle.capacity ng-options=\"c as c for c in vehicleCapacityJSON\"><option style=display:none value=\"\">SEAT</option></select></div><div ng-show=!showErrorMessage ng-messages=signupForm.capacity.$error class=error-msg-edit><p ng-message=required class=error-msg>Please select available seats</p></div></span></div><div class=\"each-row seater-section\"><div><span><img class=icon-style src=assets/images/icon_car.png></span></div><div class=input-fields><input class=\"form-control input-boxes\" ng-class=\"{'error-border':!showErrorMessage}\" maxlength=13 name=vehicleNo required ng-pattern=\"/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/\" ng-model=user.vehicle.vehicleNo placeholder=\"VEHICLE REGISTRATION NUMBER\"></div><div ng-show=!showErrorMessage ng-messages=signupForm.vehicleNo.$error class=error-msg-edit><p ng-message=required class=error-msg>Registration Number is required</p><p ng-message=pattern class=error-msg>Invalid Registration Number</p></div></div><div class=each-row><input type=button class=\"input-buttons login-input-box\" name=continue value=CONTINUE ng-click=goToStep(3)></div></div>"
  );


  $templateCache.put('app/admin/admin.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><p>The delete user and user index api routes are restricted to users with the 'admin' role.</p><ul class=list-group><li class=list-group-item ng-repeat=\"user in users\"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class=\"glyphicon glyphicon-trash pull-right\"></span></a></li></ul></div>"
  );


  $templateCache.put('app/availableRides/availableRides.html',
    "<div class=page-wrapper><div class=\"container login-container user-home-container pad-R-none pad-L-none\"><div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><span class=\"glyphicon glyphicon-chevron-left cursor-pointer\" ng-click=toggleHamburger()></span> <span class=heading>Avaialble Rides</span></div><div class=\"form-section functionality-wrap avail-list-wrap\"><div class=\"col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none each-vailable-ride\"><div class=\"col-md-3 col-sm-3 col-xs-3 avail-list-img-sec\"><img src=assets/images/user-image.jpg class=avail-user-img></div><div class=\"col-md-9 col-sm-9 col-xs-9\"><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><span class=\"pull-left input-labels\">Bob Martin</span> <span class=\"pull-right input-labels\">01/01/2015</span></div><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><div class=availability-label>Availability</div><div class=\"avail-seat-wrap field-gap-top field-gap-bottom\"><span class=\"each-seat available\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat available selected\"></span></div></div></div></div><div class=\"col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none each-vailable-ride\"><div class=\"col-md-3 col-sm-3 col-xs-3 avail-list-img-sec\"><img src=assets/images/user-image.jpg class=avail-user-img></div><div class=\"col-md-9 col-sm-9 col-xs-9\"><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><span class=\"pull-left input-labels\">Bob Martin</span> <span class=\"pull-right input-labels\">01/01/2015</span></div><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><div class=availability-label>Availability</div><div class=\"avail-seat-wrap field-gap-top field-gap-bottom\"><span class=\"each-seat available\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat available selected\"></span></div></div></div></div><div class=\"col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none each-vailable-ride\"><div class=\"col-md-3 col-sm-3 col-xs-3 avail-list-img-sec\"><img src=assets/images/user-image.jpg class=avail-user-img></div><div class=\"col-md-9 col-sm-9 col-xs-9\"><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><span class=\"pull-left input-labels\">Bob Martin</span> <span class=\"pull-right input-labels\">01/01/2015</span></div><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><div class=availability-label>Availability</div><div class=\"avail-seat-wrap field-gap-top field-gap-bottom\"><span class=\"each-seat available\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat available selected\"></span></div></div></div></div><div class=\"col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none each-vailable-ride\"><div class=\"col-md-3 col-sm-3 col-xs-3 avail-list-img-sec\"><img src=assets/images/user-image.jpg class=avail-user-img></div><div class=\"col-md-9 col-sm-9 col-xs-9\"><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><span class=\"pull-left input-labels\">Bob Martin</span> <span class=\"pull-right input-labels\">01/01/2015</span></div><div class=\"col-md-12 col-sn-12 col-xs-12 pad-R-none pad-L-none\"><div class=availability-label>Availability</div><div class=\"avail-seat-wrap field-gap-top field-gap-bottom\"><span class=\"each-seat available\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat occupied\"></span> <span class=\"each-seat available selected\"></span></div></div></div></div></div></div></div>"
  );


  $templateCache.put('app/home/home.html',
    "<div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><span class=\"glyphicon glyphicon-chevron-left cursor-pointer\" ng-click=toggleHamburger()></span> <span class=heading>Home</span></div><div><img class=\"img-responsive userHome-back\" src=assets/images/analytics.jpg width=320 height=568></div>"
  );


  $templateCache.put('app/intro/intro.html',
    "<section id=features class=blue ng-init=\"index=2\"><div class=content><slick dots=true infinite=false speed=300 slides-to-show=1 touch-move=false slides-to-scroll=1 class=\"slider one-time\"><div class=slide-wrap><div class=\"slide-info-section slide-1\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_search.png></div><p>Find a companion</p><p>to commute with</p></div></div><div class=slide-wrap><div class=\"slide-info-section slide-2\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_save_exp.png></div><p>Share fuel costs</p><p>and experiences</p></div></div><div class=slide-wrap><div class=\"slide-info-section slide-3\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_make_friend.png></div><p>Make new friends</p><p>while commuting</p></div></div><div class=slide-wrap><div class=\"slide-info-section slide-4\"><div class=icon-img-wrap><img class=slide-icons src=assets/images/intro-slider/ico_make_friend.png></div><p>Save fuel, reduce traffic</p><p>and save earth</p><div class=get-started-section><a class=get-started-link ui-sref=userHome.home>Get Started</a></div></div></div></slick><!-- <p ng-click=\"index=4\">Change index to 4</p>\n" +
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
    "<div class=main-page-wrapper><div><div class=\"col-md-12 col-sm-12 col-xs-12 location-section\"><div class=\"col-md-12 col-sm-12 col-xs-12 content-wrapper map-content-wrapper\"><svg class=map-svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink version=1.1 x=0px y=0px viewbox=\"0 0 100 125\" style=\"enable-background:new 0 0 100 100\" xml:space=preserve><path class=path-0 d=\"M73.5,48.3l-1.4,2.4l5.9,2.5l-7.8,4.5l-1.6-0.9l-0.3,0.5l1.3,0.7L67,59.4l-0.6,1.1l3.8-2.2l8.6,4.7l-8.9,5.5  L62,63l1.1-0.7l-0.3-0.5l-1.4,0.8l-5.9-4.1l4.1-2.2l-0.3-0.5L55,58.1l-4.7-3.3l6.6-3.4L56,49.9l-3-1.6l1.6-0.8l-0.3-0.5l-1.9,1  L48.9,46l3.8-1.8l-0.3-0.5l-4.2,2L45,43.9l5.5-2.6l0.7,0.3l-1.1-1.9l-12.9,5.9l-14.3-3.6L5,50.3l10.2,41.3l36.6-22.1l21.3,1.4  L95,56.9L73.5,48.3z M54.8,58.9l0.1-0.1l5.3,3.7l-7.3-1l-5-4l6.9,1.2L54.8,58.9z M41.8,53.5l3.8,3L37.2,55l-0.1-0.1l-0.1,0l-3.2-3  L41.8,53.5z M33.1,51.1L33,51l-0.1,0l-2.4-2.2l7.3,1.6l2.9,2.3L33.1,51.1z M39.2,50.6l5.9,1.3l0.1,0.1l0.1-0.1l3,2.1L42,52.9  L39.2,50.6z M38.1,49.8L36,48.1l5.5,1.3l0.1,0.1l0.1-0.1l2.3,1.6L38.1,49.8z M36.7,49.5l-7-1.5l-0.1-0.1l-0.1,0l-1.8-1.7l6.7,1.6  L36.7,49.5z M29,48.1l-8.2,4l-1.7-2.5l7.6-3.6L29,48.1z M29.5,48.6l2.9,2.7l-9.1,4.6l-2.1-3.2L29.5,48.6z M32.8,51.7l3.7,3.5  l-10.2,5.3l-2.7-4.2L32.8,51.7z M37,55.7l4.8,4.6l-11.5,6.4l-3.6-5.5L37,55.7z M38,55.8l8.6,1.5l5.1,4L42.5,60l-0.1-0.1l-0.1,0  L38,55.8z M53.7,57.9l-6.8-1.2l-3.8-3l6.4,1.3l0.1,0.1l0.1-0.1L53.7,57.9z M56.5,50.9l-6.8,3.5l-3.8-2.7l6.4-3.2L56.5,50.9z   M51.6,48.2l-6.3,3.1l-3.1-2.2l5.9-2.8L51.6,48.2z M44.3,44.2l3.2,1.7l-5.8,2.8l-2.8-2L44.3,44.2z M38.2,46.8L38.1,47l2.1,1.4  l-5.3-1.3l-2.2-1.7L38.2,46.8z M31.6,45.2l-0.1,0.1l1.9,1.5L27,45.3l-0.1-0.1l-0.1,0l-1.7-1.7L31.6,45.2z M24.2,43.6l2.1,1.9  l-7.5,3.5l-1.5-2.3L24.2,43.6z M9.1,50.5l7.6-3.5l1.5,2.3l-8.2,3.9L9.1,50.5z M10.1,53.8l8.4-4l1.7,2.5l-9.1,4.4L10.1,53.8z   M11.3,57.4l9.2-4.5l2.1,3.2l-10.1,5.1L11.3,57.4z M12.8,61.8L23,56.7l2.7,4.2l-11.3,5.9L12.8,61.8z M14.6,67.4l11.5-6l3.6,5.6  l-12.9,7.1L14.6,67.4z M20.1,84.3L17,74.7l13.1-7.2l5.2,7.9L20.1,84.3z M35.7,75l-5.1-7.9l11.7-6.4l6.8,6.4L35.7,75z M49.7,67  L49.7,67l-6.5-6.2l9.4,1.3l7.4,5.8L49.7,67z M60.9,68L60.9,68l-7.1-5.7l7.4,1l0.1,0.1l0.1-0.1l7.6,5.3L60.9,68z M70.8,58l7.9-4.5  l9.2,4l-8.5,5.2L70.8,58z\"><g><path class=path-1 fill=#02A554 d=\"M78.9,16.9c-3-5.2-8.6-8.5-14.7-8.5c-6,0-11.6,3.2-14.7,8.5c-3,5.2-3,11.7,0,16.9c4.9,8.5,9.8,16.9,14.7,25.4   c4.9-8.5,9.8-16.9,14.7-25.4C82,28.6,82,22.2,78.9,16.9z M64.3,34.9c-5.3,0-9.5-4.3-9.5-9.5c0-5.3,4.3-9.5,9.5-9.5   c5.3,0,9.5,4.3,9.5,9.5C73.8,30.7,69.5,34.9,64.3,34.9z\"></g></svg><div class=\"col-md-12 col-sm-12 col-xs-12\"><input type=button class=locate-me value=\"LOCATE ME\" ng-click=openMap()> <input type=button class=locate-me value=SYNC ng-click=fetch()></div></div></div><div class=\"col-md-12 col-sm-12 col-xs-12 mainpage-signup-section\"><div class=\"col-md-12 col-sm-12 col-xs-12 content-wrapper\"><svg class=signup-main-svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink version=1.1 x=0px y=0px viewbox=\"0 0 100 125\" enable-background=\"new 0 0 100 100\" xml:space=preserve><g><path class=path-0 d=\"M95.438,80.064H33.325V68.491l12.114-5.922c0.251-1.752,0.938-4.743,2.756-5.828v-3.81   c-0.067-0.41-0.265-1.121-0.566-1.498c-0.932-1.165-2.117-4.371-2.561-6.852c-0.423-0.493-1.016-1.379-1.311-2.703   c-0.035-0.159-0.081-0.349-0.132-0.562c-0.601-2.493-1.053-4.842,0.001-6.182c0.183-0.232,0.401-0.421,0.646-0.564   c-0.357-3.267-0.914-10.742,1.024-13.812c2.468-3.907,8.334-8.259,12.807-8.259h2.645c4.473,0,10.34,4.353,12.808,8.259   c1.938,3.07,1.382,10.545,1.024,13.812c0.245,0.143,0.463,0.333,0.646,0.564c1.055,1.339,0.602,3.688,0,6.182   c-0.052,0.213-0.098,0.403-0.133,0.561c-0.294,1.324-0.886,2.209-1.309,2.703c-0.444,2.486-1.631,5.693-2.562,6.854   c-0.298,0.373-0.495,1.081-0.563,1.497v3.808c1.796,1.073,2.487,4.006,2.745,5.767c2.253,0.929,8.825,3.633,14.924,6.101   c8.072,3.27,9.745,8.237,9.812,8.447c0.168,0.511,0.177,1.309-0.312,1.985C97.488,79.507,96.799,80.064,95.438,80.064z    M36.325,77.064h58.491c-0.813-1.308-2.874-3.756-7.615-5.676c-7.518-3.043-15.754-6.443-15.754-6.443l-0.835-0.345l-0.086-0.901   c-0.205-2.149-0.942-4.151-1.416-4.377h-1.5l0.048-1.49l0.012-5.194c0.023-0.189,0.259-1.885,1.21-3.077   c0.488-0.609,1.673-3.515,2.015-5.896l0.084-0.586l0.462-0.371l0,0c-0.003,0,0.498-0.462,0.725-1.481   c0.038-0.173,0.088-0.381,0.145-0.614c0.364-1.512,0.553-2.588,0.562-3.215l-1.713,0.49l0.271-2.27   c0.557-3.993,0.938-11.124-0.41-13.259c-1.963-3.107-6.983-6.86-10.271-6.86h-2.645c-3.288,0-8.307,3.753-10.271,6.861   c-1.348,2.135-0.967,9.265-0.41,13.258l0.319,2.283l-1.761-0.503c0.009,0.626,0.197,1.703,0.561,3.215   c0.056,0.233,0.106,0.441,0.145,0.613c0.228,1.024,0.733,1.485,0.755,1.505l0.407,0.364l0.11,0.569   c0.34,2.376,1.525,5.284,2.013,5.894c0.953,1.192,1.188,2.888,1.212,3.078l0.012,0.186v6.509h-1.5   c-0.426,0.216-1.164,2.219-1.37,4.368l-0.08,0.836l-11.919,5.828V77.064z\"><path class=path-1 fill=#02A554 d=\"M21.687,90.104H11.403v-10.06H1.343V69.76h10.06V59.699h10.284V69.76h10.06v10.284h-10.06V90.104z M14.403,87.104h4.284   v-10.06h10.06V72.76h-10.06V62.699h-4.284V72.76H4.343v4.284h10.06V87.104z\"></g></svg><div class=\"col-md-12 col-sm-12 col-xs-12\"><input type=button class=locate-me value=\"SIGN UP\" ng-click=openSignupForm()> <input type=button class=locate-me value=\"Test App\" ui-sref=userHome.home></div></div></div></div></div>"
  );


  $templateCache.put('app/main/trackMyLocation.html',
    "<p>Locate Me</p><div id=mapCanvas style=width:500px;height:380px></div><button ng-click=startTracking()>Find my Location</button>"
  );


  $templateCache.put('app/map/map.html',
    "<p>Locate Me</p><div id=mapCanvas style=width:500px;height:380px></div><button ng-click=startTracking()>Find my Location</button>"
  );


  $templateCache.put('app/postRides/postRides.html',
    "<div class=page-wrapper><div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><span class=\"glyphicon glyphicon-chevron-left cursor-pointer\" ng-click=toggleHamburger()></span> <span class=heading>Post Ride</span></div><div class=\"container login-container\"><form name=userProfileUpdateForm class=animation-form-signup ng-submit=updateUserData() novalidate><div class=\"form-section signup-section-form\"><div class=each-row><div><span><img class=icon-style src=assets/images/icon_home_address.png></span></div><div class=\"input-fields address-fields\"><input ng-class=\"{'error-border':!showErrorMessage}\" name=rideSource class=\"form-control input-boxes ride-source-field\" ng-model=ride.source placeholder=\"LEAVING FROM\" required></div><div class=icon-address-fields><span><img class=icon-style src=assets/images/icon_location.png ng-click=getLocation()></span></div><div ng-show=!showErrorMessage ng-messages=postRideForm.rideSource.$error class=error-msg-edit><p ng-message=required class=error-msg>Ride source is required</p></div></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_office_address.png></span></div><div class=\"input-fields address-fields\"><input ng-class=\"{'error-border':!showErrorMessage}\" name=rideDestination class=\"form-control input-boxes home-address-changer\" ng-model=ride.destination placeholder=\"LEAVING FOR\" required></div><div class=icon-address-fields><span><img class=icon-style src=assets/images/icon_location.png ng-click=getLocation()></span></div><div ng-show=!showErrorMessage ng-messages=postRideForm.rideDestination.$error class=error-msg-edit><p ng-message=required class=error-msg>Ride destination is required</p></div></div><div class=each-row><span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_time.png></span></div><div class=input-fields><select name=leavingIn class=\"timeslot login-input-box\" ng-model=ride.leavingIn ng-class=\"{'error-border':!showErrorMessage}\" required ng-options=\"t as t for t in leavingInJSON\"><option style=display:none value=\"\">LEAVING IN</option></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.leavingIn.$error class=error-msg-edit><p ng-message=required class=error-msg>Leaving in min. is required</p></div></span> <span class=each-row-half><div><span><img class=icon-style src=assets/images/icon_seat.png></span></div><div class=input-fields><select class=\"seater-select login-input-box\" name=availableSeats ng-class=\"{'error-border':!showErrorMessage}\" required ng-model=ride.availableSeats ng-options=\"c as c for c in availableSeatsJSON\"><option style=display:none value=\"\">SEATS AVAILABLE</option></select></div><div ng-show=!showErrorMessage ng-messages=postRideForm.availableSeats.$error class=error-msg-edit><p ng-message=required class=error-msg>Available seats is required</p></div></span></div><div class=each-row><input type=button class=input-buttons name=syncData value=\"POST RIDE\" ng-click=postRide()></div></div></form></div></div>"
  );


  $templateCache.put('app/startSampling/startSampling.html',
    "<div class=page-wrapper><div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><span class=\"glyphicon glyphicon-chevron-left cursor-pointer\" ng-click=toggleHamburger()></span> <span class=heading>Start Sampling</span></div><div class=\"container login-container\"><form name=userProfileUpdateForm class=animation-form-signup ng-submit=updateUserData() novalidate><div class=\"form-section signup-section-form\"><div class=each-row><input type=button class=input-buttons name=syncData value={{buttonText}} ng-click=startOrStopSampling(buttonText)></div></div></form><leaflet event-broadcast=events id=myMap defaults=defaults center=center paths=paths></leaflet></div></div>"
  );


  $templateCache.put('app/suggestions/suggestions.html',
    "<div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><span class=\"glyphicon glyphicon-chevron-left cursor-pointer\" ng-click=toggleHamburger()></span> <span class=heading>Get Suggestions</span></div><div class=suggestion-map-wrap><leaflet markers=markers lf-center=center event-broadcast=events id=myMap defaults=defaults></leaflet></div>"
  );


  $templateCache.put('app/userHome/userHome.html',
    "<div class=main-page-wrapper><!-- Hamburger Content --><div class=\"show-none hamburger-content\" ng-class=\"{show : tgState}\"><div class=\"col-md-11 col-sm-11 col-xs-11 pad-R-none pad-L-none ham-con-wrap\"><div class=\"col-md-12 col-sm-12 col-xs-12 hamburger-image-section\"><div class=\"col-md-12 col-sm-12 col-xs-12\"><svg ng-click=toggleHamburger() class=close-hamburger-menu xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink height=32px id=Layer_1 style=\"enable-background:new 0 0 32 32\" version=1.1 viewbox=\"0 0 32 32\" width=32px xml:space=preserve><path d=\"M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z\"></svg></div><div class=user-image-hamburger-wrap><a ui-sref=userHome.userProfile><img src={{currentUser.userPhotoUrl}} ng-click=toggleHamburger() class=avail-user-img><!-- {{currentUser.userPhotoUrl}} --><div class=user-indication-image-wrap><img class=user-indication-image src=assets/images/3x/ico_available.png></div><!-- <svg>\n" +
    "\t\t\t\t\t\t  <circle cx=\"50\" cy=\"50\" r=\"5\" class=\"indicator-circle\"/>\n" +
    "\t\t\t\t\t\t</svg> --></a></div><p class=hamburger-username>{{currentUser.empName}}</p><div class=\"col-lg-12 col-md-12 col-sm-12 col-xs-12 user-locationham-wrap\"><span class=\"glyphicon glyphicon-map-marker\"></span> <span class=user-location-ham>Pune, Maharashtra</span></div></div><div class=\"col-md-12 col-sm-12 col-xs-12 pad-R-none pad-L-none\"><ul class=functionality-ham-list><li><img src=assets/images/3x/ico_post_ride_off.png class=ham-menu-icon> <a class=function-links ui-sref=userHome.postRides ng-click=toggleHamburger()>POST RIDE</a></li><li><img src=assets/images/3x/ico_get_sugg_off.png class=ham-menu-icon> <a class=function-links ui-sref=userHome.suggestions ng-click=toggleHamburger()>GET SUGGESTIONS</a></li><li><img src=assets/images/3x/ico_sampling_off.png class=ham-menu-icon> <a class=function-links ui-sref=userHome.availableRides ng-click=toggleHamburger()>AVAILABLE RIDES</a></li><li><img src=assets/images/3x/ico_sampling_off.png class=ham-menu-icon> <a class=function-links ui-sref=userHome.startSampling ng-click=toggleHamburger()>START SAMPLING</a></li><li><img src=assets/images/3x/ico_analyze_off.png class=ham-menu-icon> <a class=function-links ui-sref=main>TEST APP</a></li><li><img src=assets/images/3x/ico_login_off.png class=ham-menu-icon> <a class=function-links ng-click=logout()>LOGOUT</a></li></ul></div></div><div class=\"col-md-1 col-sm-1 col-xs-1 pad-R-none pad-L-none hamburger-overlay\" ng-click=toggleHamburger()></div></div><!-- page content --><div class=main-content ng-class=\"{show : tgState}\"><!-- <hamburger-toggle state=\"tgState\"></hamburger-toggle> --><ui-view></ui-view></div></div>"
  );


  $templateCache.put('app/userMarker/userMarker.html',
    "<div class=cn-wrapper id=cn-wrapper>{{contactno}}<ul><li><a ng-href=\"tel: {{contactno}}\"><img class=calling-icon-map src=assets/images/map-icons/icon_call.png></a></li><li><a href=#><img src=assets/images/map-icons/icon_contact_rollover.png></a></li><li><a href=#><img src=assets/images/map-icons/icon_favorite.png></a></li><li><a href=#><img class=add-icon-map src=assets/images/map-icons/icon_add.png></a></li></ul></div>"
  );


  $templateCache.put('app/userProfile/userProfile.html',
    "<div class=page-wrapper><div class=\"col-md-12 col-sm-12 col-xs-12 header-section\"><span class=\"glyphicon glyphicon-chevron-left cursor-pointer\" ng-click=toggleHamburger()></span> <span class=heading>User Profile</span></div><div class=\"container login-container\"><form name=userProfileUpdateForm class=animation-form-signup ng-submit=updateUserData() novalidate><div class=\"form-section signup-section-form\"><div class=image-update-wrap><div class=\"col-lg-9 col-md-9 col-sm-9 col-xs-9 pad-L-none pad-R-none user-image-update\"><img ng-if=selectedImage class=profile-image-update-sec ng-src={{selectedImage}} alt=user-image> <img ng-if=!selectedImage class=profile-image-update-sec src=https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png alt=user-image></div><div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 image-update-btn\"><span class=\"glyphicon glyphicon-pencil\" ng-click=getImageSaveContact()></span></div></div><div class=each-row><div><span><img class=icon-style src=assets/images/icon_home_address.png></span></div><div class=\"input-fields address-fields\"><input ng-class=\"{'error-border':!showErrorMessage}\" name=homeAddress class=\"form-control input-boxes home-address-changer\" ng-model=user.homeAddress placeholder=\"HOME ADDRESS\" required></div><div class=icon-address-fields><span><img class=icon-style src=assets/images/icon_location.png ng-click=getLocation()></span></div><div ng-show=!showErrorMessage ng-messages=signupForm.homeAddress.$error class=error-msg-edit><p ng-message=required class=error-msg>Home Address is required</p></div></div><div class=each-row><input type=button class=input-buttons name=syncData value=\"SYNC DATA\" ng-click=syncUserLocationData()></div></div></form></div></div>"
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

