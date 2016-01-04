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
				   timeout: 5000,
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

	   batchSync:function(){
	   		localStorage.retrieve('SavedLocationCoordinates').then(function(locations){
	   			var storedlocations = locations;
	   			if(storedlocations == null) return;
	   			storedlocations = JSON.parse(storedlocations);
	   			trackedLocations = storedlocations.TrackedLocations;
	   			while(trackedLocations.length > 0){
	   				if(trackedLocations.length <= 100) syncCoordinates();
	   				else{
	   					httpRequest.post(config.apis.syncLocations,trackedLocations.splice(0, 100)).
				   		then(function(res){
				   			if(res.status == 201){
				   			   var objectToStoreTheTrackedLocationsArray = {};	// Object to store the TrackedLocations Array
							   objectToStoreTheTrackedLocationsArray.TrackedLocations = [];
							   objectToStoreTheTrackedLocationsArray.TrackedLocations = trackedLocations;
							   localStorage.store('SavedLocationCoordinates',JSON.stringify(objectToStoreTheTrackedLocationsArray)).
							   then(function(val){
							   	   batchSync();
							   });
				   			}
				   		});
	   				}
	   			}
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


/**
 * Parse JavaScript SDK v1.6.7
 *
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * The source tree of this library can be found at
 *   https://github.com/ParsePlatform/Parse-SDK-JS
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.Parse=e()}}(function(){return function e(t,r,n){function a(o,i){if(!r[o]){if(!t[o]){var u="function"==typeof require&&require;if(!i&&u)return u(o,!0);if(s)return s(o,!0);var l=new Error("Cannot find module '"+o+"'");throw l.code="MODULE_NOT_FOUND",l}var c=r[o]={exports:{}};t[o][0].call(c.exports,function(e){var r=t[o][1][e];return a(r?r:e)},c,c.exports,e,t,r,n)}return r[o].exports}for(var s="function"==typeof require&&require,o=0;o<n.length;o++)a(n[o]);return a}({1:[function(e,t,r){"use strict";function n(e,t,r){if(e=e||"",e=e.replace(/^\s*/,""),e=e.replace(/\s*$/,""),0===e.length)throw new TypeError("A name for the custom event must be provided");for(var n in t)if("string"!=typeof n||"string"!=typeof t[n])throw new TypeError('track() dimensions expects keys and values of type "string".');return r=r||{},o["default"].getAnalyticsController().track(e,t)._thenRunCallbacks(r)}var a=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r.track=n;var s=e("./CoreManager"),o=a(s);o["default"].setAnalyticsController({track:function(e,t){var r=o["default"].getRESTController();return r.request("POST","events/"+e,{dimensions:t})}})},{"./CoreManager":3,"babel-runtime/helpers/interop-require-default":47}],2:[function(e,t,r){"use strict";function n(e,t,r){if(r=r||{},"string"!=typeof e||0===e.length)throw new TypeError("Cloud function name must be a string.");return o["default"].getCloudController().run(e,t,{useMasterKey:r.useMasterKey})._thenRunCallbacks(r)}var a=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r.run=n;var s=e("./CoreManager"),o=a(s),i=e("./decode"),u=a(i),l=e("./encode"),c=a(l),f=e("./ParseError"),d=a(f),h=e("./ParsePromise"),p=a(h);o["default"].setCloudController({run:function(e,t,r){var n=o["default"].getRESTController(),a=(0,c["default"])(t,!0),s=n.request("POST","functions/"+e,a,{useMasterKey:!!r.useMasterKey});return s.then(function(e){var t=(0,u["default"])(e);return t&&t.hasOwnProperty("result")?p["default"].as(t.result):p["default"].error(new d["default"](d["default"].INVALID_JSON,"The server returned an invalid response."))})._thenRunCallbacks(r)}})},{"./CoreManager":3,"./ParseError":10,"./ParsePromise":16,"./decode":29,"./encode":30,"babel-runtime/helpers/interop-require-default":47}],3:[function(e,t,r){(function(e){"use strict";var r={IS_NODE:"undefined"!=typeof e&&!!e.versions&&!!e.versions.node,REQUEST_ATTEMPT_LIMIT:5,SERVER_URL:"https://api.parse.com",VERSION:"1.6.7",APPLICATION_ID:null,JAVASCRIPT_KEY:null,MASTER_KEY:null,USE_MASTER_KEY:!1,PERFORM_USER_REWRITE:!0,FORCE_REVOCABLE_SESSION:!1};t.exports={get:function(e){if(r.hasOwnProperty(e))return r[e];throw new Error("Configuration key not found: "+e)},set:function(e,t){r[e]=t},setAnalyticsController:function(e){if("function"!=typeof e.track)throw new Error("AnalyticsController must implement track()");r.AnalyticsController=e},getAnalyticsController:function(){return r.AnalyticsController},setCloudController:function(e){if("function"!=typeof e.run)throw new Error("CloudController must implement run()");r.CloudController=e},getCloudController:function(){return r.CloudController},setConfigController:function(e){if("function"!=typeof e.current)throw new Error("ConfigController must implement current()");if("function"!=typeof e.get)throw new Error("ConfigController must implement get()");r.ConfigController=e},getConfigController:function(){return r.ConfigController},setFileController:function(e){if("function"!=typeof e.saveFile)throw new Error("FileController must implement saveFile()");if("function"!=typeof e.saveBase64)throw new Error("FileController must implement saveBase64()");r.FileController=e},getFileController:function(){return r.FileController},setInstallationController:function(e){if("function"!=typeof e.currentInstallationId)throw new Error("InstallationController must implement currentInstallationId()");r.InstallationController=e},getInstallationController:function(){return r.InstallationController},setPushController:function(e){if("function"!=typeof e.send)throw new Error("PushController must implement send()");r.PushController=e},getPushController:function(){return r.PushController},setObjectController:function(e){if("function"!=typeof e.save)throw new Error("ObjectController must implement save()");if("function"!=typeof e.fetch)throw new Error("ObjectController must implement fetch()");if("function"!=typeof e.destroy)throw new Error("ObjectController must implement destroy()");r.ObjectController=e},getObjectController:function(){return r.ObjectController},setQueryController:function(e){if("function"!=typeof e.find)throw new Error("QueryController must implement find()");r.QueryController=e},getQueryController:function(){return r.QueryController},setRESTController:function(e){if("function"!=typeof e.request)throw new Error("RESTController must implement request()");if("function"!=typeof e.ajax)throw new Error("RESTController must implement ajax()");r.RESTController=e},getRESTController:function(){return r.RESTController},setSessionController:function(e){if("function"!=typeof e.getSession)throw new Error("A SessionController must implement getSession()");r.SessionController=e},getSessionController:function(){return r.SessionController},setStorageController:function(e){if(e.async){if("function"!=typeof e.getItemAsync)throw new Error("An async StorageController must implement getItemAsync()");if("function"!=typeof e.setItemAsync)throw new Error("An async StorageController must implement setItemAsync()");if("function"!=typeof e.removeItemAsync)throw new Error("An async StorageController must implement removeItemAsync()")}else{if("function"!=typeof e.getItem)throw new Error("A synchronous StorageController must implement getItem()");if("function"!=typeof e.setItem)throw new Error("A synchronous StorageController must implement setItem()");if("function"!=typeof e.removeItem)throw new Error("A synchonous StorageController must implement removeItem()")}r.StorageController=e},getStorageController:function(){return r.StorageController},setUserController:function(e){if("function"!=typeof e.setCurrentUser)throw new Error("A UserController must implement setCurrentUser()");if("function"!=typeof e.currentUser)throw new Error("A UserController must implement currentUser()");if("function"!=typeof e.currentUserAsync)throw new Error("A UserController must implement currentUserAsync()");if("function"!=typeof e.signUp)throw new Error("A UserController must implement signUp()");if("function"!=typeof e.logIn)throw new Error("A UserController must implement logIn()");if("function"!=typeof e.become)throw new Error("A UserController must implement become()");if("function"!=typeof e.logOut)throw new Error("A UserController must implement logOut()");if("function"!=typeof e.requestPasswordReset)throw new Error("A UserController must implement requestPasswordReset()");if("function"!=typeof e.upgradeToRevocableSession)throw new Error("A UserController must implement upgradeToRevocableSession()");if("function"!=typeof e.linkWith)throw new Error("A UserController must implement linkWith()");r.UserController=e},getUserController:function(){return r.UserController}}}).call(this,e("_process"))},{_process:49}],4:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var a,s,o=e("./parseDate"),i=n(o),u=e("./ParseUser"),l=n(u),c=!1;r["default"]={init:function(e){if("undefined"==typeof FB)throw new Error("The Facebook JavaScript SDK must be loaded before calling init.");if(s={},e)for(var t in e)s[t]=e[t];if(s.status&&"undefined"!=typeof console){var r=console.warn||console.log||function(){};r.call(console,'The "status" flag passed into FB.init, when set to true, can interfere with Parse Facebook integration, so it has been suppressed. Please call FB.getLoginStatus() explicitly if you require this behavior.')}s.status=!1,FB.init(s),l["default"]._registerAuthenticationProvider({authenticate:function(e){var t=this;"undefined"==typeof FB&&e.error(this,"Facebook SDK not found."),FB.login(function(r){r.authResponse?e.success&&e.success(t,{id:r.authResponse.userID,access_token:r.authResponse.accessToken,expiration_date:new Date(1e3*r.authResponse.expiresIn+(new Date).getTime()).toJSON()}):e.error&&e.error(t,r)},{scope:a})},restoreAuthentication:function(e){if(e){var t=(0,i["default"])(e.expiration_date),r=t?(t.getTime()-(new Date).getTime())/1e3:0,n={userID:e.id,accessToken:e.access_token,expiresIn:r},a={};if(s)for(var o in s)a[o]=s[o];a.authResponse=n,a.status=!1;var u=FB.getAuthResponse();u&&u.userID!==n.userID&&FB.logout(),FB.init(a)}return!0},getAuthType:function(){return"facebook"},deauthenticate:function(){this.restoreAuthentication(null)}}),c=!0},isLinked:function(e){return e._isLinked("facebook")},logIn:function(e,t){if(e&&"string"!=typeof e){var r={};if(t)for(var n in t)r[n]=t[n];return r.authData=e,l["default"]._logInWith("facebook",r)}if(!c)throw new Error("You must initialize FacebookUtils before calling logIn.");return a=e,l["default"]._logInWith("facebook",t)},link:function(e,t,r){if(t&&"string"!=typeof t){var n={};if(r)for(var s in r)n[s]=r[s];return n.authData=t,e._linkWith("facebook",n)}if(!c)throw new Error("You must initialize FacebookUtils before calling link.");return a=t,e._linkWith("facebook",r)},unlink:function(e,t){if(!c)throw new Error("You must initialize FacebookUtils before calling unlink.");return e._unlinkFrom("facebook",t)}},t.exports=r["default"]},{"./ParseUser":21,"./parseDate":34,"babel-runtime/helpers/interop-require-default":47}],5:[function(e,t,r){"use strict";function n(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}function a(){return n()+n()+"-"+n()+"-"+n()+"-"+n()+"-"+n()+n()+n()}var s=e("babel-runtime/helpers/interop-require-default")["default"],o=e("./CoreManager"),i=(s(o),e("./ParsePromise")),u=s(i),l=e("./Storage"),c=s(l),f=null;t.exports={currentInstallationId:function(){if("string"==typeof f)return u["default"].as(f);var e=c["default"].generatePath("installationId");return c["default"].getItemAsync(e).then(function(t){return t?(f=t,t):(t=a(),c["default"].setItemAsync(e,t).then(function(){return f=t,t}))})},_clearCache:function(){f=null},_setInstallationIdCache:function(e){f=e}}},{"./CoreManager":3,"./ParsePromise":16,"./Storage":24,"babel-runtime/helpers/interop-require-default":47}],6:[function(e,t,r){"use strict";function n(e,t){var r=T[e];return r?r[t]||null:null}function a(e,t,r){var a=n(e,t);return a?a:(T[e]||(T[e]={}),r||(r={serverData:{},pendingOps:[{}],objectCache:{},tasks:new I["default"],existed:!1}),a=T[e][t]=r)}function s(e,t){var r=n(e,t);return null===r?null:(delete T[e][t],r)}function o(e,t){var r=n(e,t);return r?r.serverData:{}}function i(e,t,r){var n=a(e,t).serverData;for(var s in r)"undefined"!=typeof r[s]?n[s]=r[s]:delete n[s]}function u(e,t){var r=n(e,t);return r?r.pendingOps:[{}]}function l(e,t,r,n){var s=a(e,t).pendingOps,o=s.length-1;n?s[o][r]=n:delete s[o][r]}function c(e,t){var r=a(e,t).pendingOps;r.push({})}function f(e,t){var r=a(e,t).pendingOps,n=r.shift();return r.length||(r[0]={}),n}function d(e,t){var r=f(e,t),n=u(e,t),a=n[0];for(var s in r)if(a[s]&&r[s]){var o=a[s].mergeWith(r[s]);o&&(a[s]=o)}else a[s]=r[s]}function h(e,t){var r=n(e,t);return r?r.objectCache:{}}function p(e,t,r){for(var n=o(e,t),a=n[r],s=u(e,t),i=0;i<s.length;i++)s[i][r]&&(a=s[i][r]instanceof N.RelationOp?s[i][r].applyTo(a,{className:e,id:t},r):s[i][r].applyTo(a));return a}function y(e,t){var r,n={},a=o(e,t);for(r in a)n[r]=a[r];for(var s=u(e,t),i=0;i<s.length;i++)for(r in s[i])s[i][r]instanceof N.RelationOp?n[r]=s[i][r].applyTo(n[r],{className:e,id:t},r):n[r]=s[i][r].applyTo(n[r]);return n}function v(e,t,r){var n=a(e,t);for(var s in r){var o=r[s];if(n.serverData[s]=o,o&&"object"==typeof o&&!(o instanceof k["default"])&&!(o instanceof C["default"])&&!(o instanceof S["default"])){var i=(0,w["default"])(o,!1,!0);n.objectCache[s]=JSON.stringify(i)}}}function b(e,t,r){var n=a(e,t);return n.tasks.enqueue(r)}function m(){T={}}var _=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r.getState=n,r.initializeState=a,r.removeState=s,r.getServerData=o,r.setServerData=i,r.getPendingOps=u,r.setPendingOp=l,r.pushPendingState=c,r.popPendingState=f,r.mergeFirstPendingState=d,r.getObjectCache=h,r.estimateAttribute=p,r.estimateAttributes=y,r.commitServerChanges=v,r.enqueueTask=b,r._clearAllState=m;var g=e("./encode"),w=_(g),O=e("./ParseFile"),C=_(O),P=e("./ParseObject"),k=_(P),A=e("./ParsePromise"),E=(_(A),e("./ParseRelation")),S=_(E),j=e("./TaskQueue"),I=_(j),N=e("./ParseOp"),T={}},{"./ParseFile":11,"./ParseObject":14,"./ParseOp":15,"./ParsePromise":16,"./ParseRelation":18,"./TaskQueue":26,"./encode":30,"babel-runtime/helpers/interop-require-default":47}],7:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/interop-require-default")["default"],a=e("babel-runtime/helpers/interop-require-wildcard")["default"],s=e("./decode"),o=n(s),i=e("./encode"),u=n(i),l=e("./CoreManager"),c=n(l),f=e("./InstallationController"),d=n(f),h=e("./ParseOp"),p=a(h),y=e("./RESTController"),v=n(y),b={initialize:function(e,t){c["default"].get("IS_NODE")&&console.log("It looks like you're using the browser version of the SDK in a node.js environment. You should require('parse/node') instead."),b._initialize(e,t)},_initialize:function(e,t,r){c["default"].set("APPLICATION_ID",e),c["default"].set("JAVASCRIPT_KEY",t),c["default"].set("MASTER_KEY",r),c["default"].set("USE_MASTER_KEY",!1)}};Object.defineProperty(b,"applicationId",{get:function(){return c["default"].get("APPLICATION_ID")},set:function(e){c["default"].set("APPLICATION_ID",e)}}),Object.defineProperty(b,"javaScriptKey",{get:function(){return c["default"].get("JAVASCRIPT_KEY")},set:function(e){c["default"].set("JAVASCRIPT_KEY",e)}}),Object.defineProperty(b,"masterKey",{get:function(){return c["default"].get("MASTER_KEY")},set:function(e){c["default"].set("MASTER_KEY",e)}}),Object.defineProperty(b,"serverURL",{get:function(){return c["default"].get("SERVER_URL")},set:function(e){c["default"].set("SERVER_URL",e)}}),b.ACL=e("./ParseACL"),b.Analytics=e("./Analytics"),b.Cloud=e("./Cloud"),b.CoreManager=e("./CoreManager"),b.Config=e("./ParseConfig"),b.Error=e("./ParseError"),b.FacebookUtils=e("./FacebookUtils"),b.File=e("./ParseFile"),b.GeoPoint=e("./ParseGeoPoint"),b.Installation=e("./ParseInstallation"),b.Object=e("./ParseObject"),b.Op={Set:p.SetOp,Unset:p.UnsetOp,Increment:p.IncrementOp,Add:p.AddOp,Remove:p.RemoveOp,AddUnique:p.AddUniqueOp,Relation:p.RelationOp},b.Promise=e("./ParsePromise"),b.Push=e("./Push"),b.Query=e("./ParseQuery"),b.Relation=e("./ParseRelation"),b.Role=e("./ParseRole"),b.Session=e("./ParseSession"),b.Storage=e("./Storage"),b.User=e("./ParseUser"),b._request=function(){for(var e=arguments.length,t=Array(e),r=0;e>r;r++)t[r]=arguments[r];return c["default"].getRESTController().request.apply(null,t)},b._ajax=function(){for(var e=arguments.length,t=Array(e),r=0;e>r;r++)t[r]=arguments[r];return c["default"].getRESTController().ajax.apply(null,t)},b._decode=function(e,t){return(0,o["default"])(t)},b._encode=function(e,t,r){return(0,u["default"])(e,r)},b._getInstallationId=function(){return c["default"].getInstallationController().currentInstallationId()},c["default"].setInstallationController(d["default"]),c["default"].setRESTController(v["default"]),b.Parse=b,t.exports=b},{"./Analytics":1,"./Cloud":2,"./CoreManager":3,"./FacebookUtils":4,"./InstallationController":5,"./ParseACL":8,"./ParseConfig":9,"./ParseError":10,"./ParseFile":11,"./ParseGeoPoint":12,"./ParseInstallation":13,"./ParseObject":14,"./ParseOp":15,"./ParsePromise":16,"./ParseQuery":17,"./ParseRelation":18,"./ParseRole":19,"./ParseSession":20,"./ParseUser":21,"./Push":22,"./RESTController":23,"./Storage":24,"./decode":29,"./encode":30,"babel-runtime/helpers/interop-require-default":47,"babel-runtime/helpers/interop-require-wildcard":48}],8:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/create-class")["default"],a=e("babel-runtime/helpers/class-call-check")["default"],s=e("babel-runtime/core-js/object/keys")["default"],o=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var i=e("./ParseRole"),u=o(i),l=e("./ParseUser"),c=o(l),f="*",d=function(){function e(t){if(a(this,e),this.permissionsById={},t&&"object"==typeof t)if(t instanceof c["default"])this.setReadAccess(t,!0),this.setWriteAccess(t,!0);else for(var r in t){var n=t[r];if("string"!=typeof r)throw new TypeError("Tried to create an ACL with an invalid user id.");this.permissionsById[r]={};for(var s in n){var o=n[s];if("read"!==s&&"write"!==s)throw new TypeError("Tried to create an ACL with an invalid permission type.");if("boolean"!=typeof o)throw new TypeError("Tried to create an ACL with an invalid permission value.");this.permissionsById[r][s]=o}}else if("function"==typeof t)throw new TypeError("ParseACL constructed with a function. Did you forget ()?")}return n(e,[{key:"toJSON",value:function(){var e={};for(var t in this.permissionsById)e[t]=this.permissionsById[t];return e}},{key:"equals",value:function(t){if(!(t instanceof e))return!1;var r=s(this.permissionsById),n=s(t.permissionsById);if(r.length!==n.length)return!1;for(var a in this.permissionsById){if(!t.permissionsById[a])return!1;if(this.permissionsById[a].read!==t.permissionsById[a].read)return!1;if(this.permissionsById[a].write!==t.permissionsById[a].write)return!1}return!0}},{key:"_setAccess",value:function(e,t,r){if(t instanceof c["default"]?t=t.id:t instanceof u["default"]&&(t="role:"+t.getName()),"string"!=typeof t)throw new TypeError("userId must be a string.");if("boolean"!=typeof r)throw new TypeError("allowed must be either true or false.");var n=this.permissionsById[t];if(!n){if(!r)return;n={},this.permissionsById[t]=n}r?this.permissionsById[t][e]=!0:(delete n[e],0===s(n).length&&delete this.permissionsById[t])}},{key:"_getAccess",value:function(e,t){t instanceof c["default"]?t=t.id:t instanceof u["default"]&&(t="role:"+t.getName());var r=this.permissionsById[t];return r?!!r[e]:!1}},{key:"setReadAccess",value:function(e,t){this._setAccess("read",e,t)}},{key:"getReadAccess",value:function(e){return this._getAccess("read",e)}},{key:"setWriteAccess",value:function(e,t){this._setAccess("write",e,t)}},{key:"getWriteAccess",value:function(e){return this._getAccess("write",e)}},{key:"setPublicReadAccess",value:function(e){this.setReadAccess(f,e)}},{key:"getPublicReadAccess",value:function(){return this.getReadAccess(f)}},{key:"setPublicWriteAccess",value:function(e){this.setWriteAccess(f,e)}},{key:"getPublicWriteAccess",value:function(){return this.getWriteAccess(f)}},{key:"getRoleReadAccess",value:function(e){if(e instanceof u["default"]&&(e=e.getName()),"string"!=typeof e)throw new TypeError("role must be a ParseRole or a String");return this.getReadAccess("role:"+e)}},{key:"getRoleWriteAccess",value:function(e){if(e instanceof u["default"]&&(e=e.getName()),"string"!=typeof e)throw new TypeError("role must be a ParseRole or a String");return this.getWriteAccess("role:"+e)}},{key:"setRoleReadAccess",value:function(e,t){if(e instanceof u["default"]&&(e=e.getName()),"string"!=typeof e)throw new TypeError("role must be a ParseRole or a String");this.setReadAccess("role:"+e,t)}},{key:"setRoleWriteAccess",value:function(e,t){if(e instanceof u["default"]&&(e=e.getName()),"string"!=typeof e)throw new TypeError("role must be a ParseRole or a String");this.setWriteAccess("role:"+e,t)}}]),e}();r["default"]=d,t.exports=r["default"]},{"./ParseRole":19,"./ParseUser":21,"babel-runtime/core-js/object/keys":41,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],9:[function(e,t,r){"use strict";function n(e){try{var t=JSON.parse(e);if(t&&"object"==typeof t)return(0,c["default"])(t)}catch(r){return null}}var a=e("babel-runtime/helpers/create-class")["default"],s=e("babel-runtime/helpers/class-call-check")["default"],o=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var i=e("./CoreManager"),u=o(i),l=e("./decode"),c=o(l),f=e("./encode"),d=(o(f),e("./escape")),h=o(d),p=e("./ParseError"),y=o(p),v=e("./ParsePromise"),b=o(v),m=e("./Storage"),_=o(m),g=function(){function e(){s(this,e),this.attributes={},this._escapedAttributes={}}return a(e,[{key:"get",value:function(e){return this.attributes[e]}},{key:"escape",value:function(e){var t=this._escapedAttributes[e];if(t)return t;var r=this.attributes[e],n="";return null!=r&&(n=(0,h["default"])(r.toString())),this._escapedAttributes[e]=n,n}}],[{key:"current",value:function(){var e=u["default"].getConfigController();return e.current()}},{key:"get",value:function(e){e=e||{};var t=u["default"].getConfigController();return t.get()._thenRunCallbacks(e)}}]),e}();r["default"]=g;var w=null,O="currentConfig";u["default"].setConfigController({current:function(){if(w)return w;var e,t=new g,r=_["default"].generatePath(O);if(!_["default"].async()){if(e=_["default"].getItem(r)){var a=n(e);a&&(t.attributes=a,w=t)}return t}return _["default"].getItemAsync(r).then(function(e){if(e){var r=n(e);r&&(t.attributes=r,w=t)}return t})},get:function(){var e=u["default"].getRESTController();return e.request("GET","config",{},{}).then(function(e){if(!e||!e.params){var t=new y["default"](y["default"].INVALID_JSON,"Config JSON response invalid.");return b["default"].error(t)}var r=new g;r.attributes={};for(var n in e.params)r.attributes[n]=(0,c["default"])(e.params[n]);return w=r,_["default"].setItemAsync(_["default"].generatePath(O),JSON.stringify(e.params)).then(function(){return r})})}}),t.exports=r["default"]},{"./CoreManager":3,"./ParseError":10,"./ParsePromise":16,"./Storage":24,"./decode":29,"./encode":30,"./escape":32,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],10:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/class-call-check")["default"];Object.defineProperty(r,"__esModule",{value:!0});var a=function s(e,t){n(this,s),this.code=e,this.message=t};r["default"]=a,a.OTHER_CAUSE=-1,a.INTERNAL_SERVER_ERROR=1,a.CONNECTION_FAILED=100,a.OBJECT_NOT_FOUND=101,a.INVALID_QUERY=102,a.INVALID_CLASS_NAME=103,a.MISSING_OBJECT_ID=104,a.INVALID_KEY_NAME=105,a.INVALID_POINTER=106,a.INVALID_JSON=107,a.COMMAND_UNAVAILABLE=108,a.NOT_INITIALIZED=109,a.INCORRECT_TYPE=111,a.INVALID_CHANNEL_NAME=112,a.PUSH_MISCONFIGURED=115,a.OBJECT_TOO_LARGE=116,a.OPERATION_FORBIDDEN=119,a.CACHE_MISS=120,a.INVALID_NESTED_KEY=121,a.INVALID_FILE_NAME=122,a.INVALID_ACL=123,a.TIMEOUT=124,a.INVALID_EMAIL_ADDRESS=125,a.MISSING_CONTENT_TYPE=126,a.MISSING_CONTENT_LENGTH=127,a.INVALID_CONTENT_LENGTH=128,a.FILE_TOO_LARGE=129,a.FILE_SAVE_ERROR=130,a.DUPLICATE_VALUE=137,a.INVALID_ROLE_NAME=139,a.EXCEEDED_QUOTA=140,a.SCRIPT_FAILED=141,a.VALIDATION_ERROR=142,a.INVALID_IMAGE_DATA=143,a.UNSAVED_FILE_ERROR=151,a.INVALID_PUSH_TIME_ERROR=152,a.FILE_DELETE_ERROR=153,a.REQUEST_LIMIT_EXCEEDED=155,a.INVALID_EVENT_NAME=160,a.USERNAME_MISSING=200,a.PASSWORD_MISSING=201,a.USERNAME_TAKEN=202,a.EMAIL_TAKEN=203,a.EMAIL_MISSING=204,a.EMAIL_NOT_FOUND=205,a.SESSION_MISSING=206,a.MUST_CREATE_USER_THROUGH_SIGNUP=207,a.ACCOUNT_ALREADY_LINKED=208,a.INVALID_SESSION_TOKEN=209,a.LINKED_ID_MISSING=250,a.INVALID_LINKED_SESSION=251,a.UNSUPPORTED_SERVICE=252,a.AGGREGATE_ERROR=600,a.FILE_READ_ERROR=601,a.X_DOMAIN_REQUEST=602,t.exports=r["default"]},{"babel-runtime/helpers/class-call-check":43}],11:[function(e,t,r){"use strict";function n(e){if(26>e)return String.fromCharCode(65+e);if(52>e)return String.fromCharCode(97+(e-26));if(62>e)return String.fromCharCode(48+(e-52));if(62===e)return"+";if(63===e)return"/";throw new TypeError("Tried to encode large digit "+e+" in base64.")}var a=e("babel-runtime/helpers/create-class")["default"],s=e("babel-runtime/helpers/class-call-check")["default"],o=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var i=e("./CoreManager"),u=o(i),l=e("./ParsePromise"),c=(o(l),function(){function e(t,r,n){s(this,e);var a=n||"";if(this._name=t,Array.isArray(r))this._source={format:"base64",base64:e.encodeBase64(r),type:a};else if("undefined"!=typeof File&&r instanceof File)this._source={format:"file",file:r,type:a};else if(r&&r.hasOwnProperty("base64")){var o=/^data:([a-zA-Z]*\/[a-zA-Z+.-]*);(charset=[a-zA-Z0-9\-\/\s]*,)?base64,(\S+)/.exec(r.base64);o&&o.length>0?this._source={format:"base64",base64:4===o.length?o[3]:o[2],type:o[1]}:this._source={format:"base64",base64:r.base64,type:a}}else if("undefined"!=typeof r)throw new TypeError("Cannot create a Parse.File with that data.")}return a(e,[{key:"name",value:function(){return this._name}},{key:"url",value:function(){return this._url}},{key:"save",value:function(e){var t=this;e=e||{};var r=u["default"].getFileController();return this._previousSave||("file"===this._source.format?this._previousSave=r.saveFile(this._name,this._source).then(function(e){return t._name=e.name,t._url=e.url,t}):this._previousSave=r.saveBase64(this._name,this._source).then(function(e){return t._name=e.name,t._url=e.url,t})),this._previousSave?this._previousSave._thenRunCallbacks(e):void 0}},{key:"toJSON",value:function(){return{__type:"File",name:this._name,url:this._url}}},{key:"equals",value:function(t){return this===t?!0:t instanceof e&&this.name()===t.name()&&this.url()===t.url()&&"undefined"!=typeof this.url()}}],[{key:"fromJSON",value:function(t){if("File"!==t.__type)throw new TypeError("JSON object does not represent a ParseFile");var r=new e(t.name);return r._url=t.url,r}},{key:"encodeBase64",value:function(e){var t=[];t.length=Math.ceil(e.length/3);for(var r=0;r<t.length;r++){var a=e[3*r],s=e[3*r+1]||0,o=e[3*r+2]||0,i=3*r+1<e.length,u=3*r+2<e.length;t[r]=[n(a>>2&63),n(a<<4&48|s>>4&15),i?n(s<<2&60|o>>6&3):"=",u?n(63&o):"="].join("")}return t.join("")}}]),e}());r["default"]=c,u["default"].setFileController({saveFile:function(e,t){if("file"!==t.format)throw new Error("saveFile can only be used with File-type sources.");var r={"X-Parse-Application-ID":u["default"].get("APPLICATION_ID"),"X-Parse-JavaScript-Key":u["default"].get("JAVASCRIPT_KEY")},n=u["default"].get("SERVER_URL");return n+="/1/files/"+e,u["default"].getRESTController().ajax("POST",n,t.file,r)},saveBase64:function(e,t){if("base64"!==t.format)throw new Error("saveBase64 can only be used with Base64-type sources.");var r={base64:t.base64};return t.type&&(r._ContentType=t.type),u["default"].getRESTController().request("POST","files/"+e,r)}}),t.exports=r["default"]},{"./CoreManager":3,"./ParsePromise":16,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],12:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/create-class")["default"],a=e("babel-runtime/helpers/class-call-check")["default"],s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var o=e("./ParsePromise"),i=s(o),u=function(){function e(t,r){a(this,e),Array.isArray(t)?(e._validate(t[0],t[1]),this._latitude=t[0],this._longitude=t[1]):"object"==typeof t?(e._validate(t.latitude,t.longitude),this._latitude=t.latitude,this._longitude=t.longitude):"number"==typeof t&&"number"==typeof r?(e._validate(t,r),this._latitude=t,this._longitude=r):(this._latitude=0,this._longitude=0)}return n(e,[{key:"toJSON",value:function(){return e._validate(this._latitude,this._longitude),{__type:"GeoPoint",latitude:this._latitude,longitude:this._longitude}}},{key:"equals",value:function(t){return t instanceof e&&this.latitude===t.latitude&&this.longitude===t.longitude}},{key:"radiansTo",value:function(e){var t=Math.PI/180,r=this.latitude*t,n=this.longitude*t,a=e.latitude*t,s=e.longitude*t,o=Math.sin((r-a)/2),i=Math.sin((n-s)/2),u=o*o+Math.cos(r)*Math.cos(a)*i*i;return u=Math.min(1,u),2*Math.asin(Math.sqrt(u))}},{key:"kilometersTo",value:function(e){return 6371*this.radiansTo(e)}},{key:"milesTo",value:function(e){return 3958.8*this.radiansTo(e)}},{key:"latitude",get:function(){return this._latitude},set:function(t){e._validate(t,this.longitude),this._latitude=t}},{key:"longitude",get:function(){return this._longitude},set:function(t){e._validate(this.latitude,t),this._longitude=t}}],[{key:"_validate",value:function(e,t){if(e!==e||t!==t)throw new TypeError("GeoPoint latitude and longitude must be valid numbers");if(-90>e)throw new TypeError("GeoPoint latitude out of bounds: "+e+" < -90.0.");if(e>90)throw new TypeError("GeoPoint latitude out of bounds: "+e+" > 90.0.");if(-180>t)throw new TypeError("GeoPoint longitude out of bounds: "+t+" < -180.0.");if(t>180)throw new TypeError("GeoPoint longitude out of bounds: "+t+" > 180.0.")}},{key:"current",value:function(t){var r=new i["default"];return navigator.geolocation.getCurrentPosition(function(t){r.resolve(new e(t.coords.latitude,t.coords.longitude))},function(e){r.reject(e)}),r._thenRunCallbacks(t)}}]),e}();r["default"]=u,t.exports=r["default"]},{"./ParsePromise":16,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],13:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/get")["default"],a=e("babel-runtime/helpers/inherits")["default"],s=e("babel-runtime/helpers/class-call-check")["default"],o=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var i=e("./ParseObject"),u=o(i),l=function(e){function t(e){if(s(this,t),n(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,"_Installation"),e&&"object"==typeof e&&!this.set(e||{}))throw new Error("Can't create an invalid Session")}return a(t,e),t}(u["default"]);r["default"]=l,u["default"].registerSubclass("_Installation",l),t.exports=r["default"]},{"./ParseObject":14,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/get":45,"babel-runtime/helpers/inherits":46,"babel-runtime/helpers/interop-require-default":47}],14:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/create-class")["default"],a=e("babel-runtime/helpers/class-call-check")["default"],s=e("babel-runtime/core-js/object/keys")["default"],o=e("babel-runtime/core-js/object/freeze")["default"],i=e("babel-runtime/core-js/object/create")["default"],u=e("babel-runtime/core-js/object/define-property")["default"],l=e("babel-runtime/helpers/interop-require-default")["default"],c=e("babel-runtime/helpers/interop-require-wildcard")["default"];Object.defineProperty(r,"__esModule",{value:!0});var f=e("./CoreManager"),d=l(f),h=e("./canBeSerialized"),p=l(h),y=e("./decode"),v=l(y),b=e("./encode"),m=l(b),_=e("./equals"),g=(l(_),e("./escape")),w=l(g),O=e("./ObjectState"),C=c(O),P=e("./ParseACL"),k=l(P),A=e("./parseDate"),E=l(A),S=e("./ParseError"),j=l(S),I=e("./ParseFile"),N=l(I),T=e("./ParseOp"),R=e("./ParsePromise"),M=l(R),D=e("./ParseQuery"),q=l(D),x=e("./ParseRelation"),U=l(x),L=e("./unique"),F=l(L),K=e("./unsavedChildren"),J=l(K),$={},W=0,B=0,G=!d["default"].get("IS_NODE"),V=function(){function e(t,r){a(this,e);var n=null;if(this._objCount=B++,"string"==typeof t)this.className=t,r&&"object"==typeof r&&(n=r);else if(t&&"object"==typeof t){this.className=t.className,n={};for(var s in t)"className"!==s&&(n[s]=t[s])}if(n&&!this.set(n))throw new Error("Can't create an invalid Parse Object");"function"==typeof this.initialize&&this.initialize.apply(this,arguments);
}return n(e,[{key:"_getId",value:function(){if("string"==typeof this.id)return this.id;if("string"==typeof this._localId)return this._localId;var e="local"+String(W++);return this._localId=e,e}},{key:"_getStateIdentifier",value:function(){return"string"==typeof this.id?G?this.id:this.id+"_"+String(this._objCount):this._getId()}},{key:"_getServerData",value:function(){return C.getServerData(this.className,this._getStateIdentifier())}},{key:"_clearServerData",value:function(){var e=this._getServerData(),t={};for(var r in e)t[r]=void 0;C.setServerData(this.className,this._getStateIdentifier(),t)}},{key:"_getPendingOps",value:function(){return C.getPendingOps(this.className,this._getStateIdentifier())}},{key:"_clearPendingOps",value:function(){var e=this._getPendingOps(),t=e[e.length-1],r=s(t);r.forEach(function(e){delete t[e]})}},{key:"_getDirtyObjectAttributes",value:function(){var t=this.attributes,r=C.getObjectCache(this.className,this._getStateIdentifier()),n={};for(var a in t){var s=t[a];if(s&&"object"==typeof s&&!(s instanceof e)&&!(s instanceof N["default"])&&!(s instanceof U["default"])){var o=(0,m["default"])(s,!1,!0),i=JSON.stringify(o);r[a]!==i&&(n[a]=s)}}return n}},{key:"_toFullJSON",value:function(){var e=this.toJSON();return e.__type="Object",e.className=this.className,e}},{key:"_getSaveJSON",value:function(){var e,t=this._getPendingOps(),r=this._getDirtyObjectAttributes(),n={};for(e in r)n[e]=new T.SetOp(r[e]).toJSON();for(e in t[0])n[e]=t[0][e].toJSON();return n}},{key:"_getSaveParams",value:function(){var e=this.id?"PUT":"POST",t=this._getSaveJSON(),r="classes/"+this.className;return this.id?r+="/"+this.id:"_User"===this.className&&(r="users"),{method:e,body:t,path:r}}},{key:"_finishFetch",value:function(e){!this.id&&e.objectId&&(this.id=e.objectId),C.initializeState(this.className,this._getStateIdentifier());var t={};for(var r in e)"ACL"===r?t[r]=new k["default"](e[r]):"objectId"!==r&&(t[r]=(0,v["default"])(e[r]),t[r]instanceof U["default"]&&t[r]._ensureParentAndKey(this,r));t.createdAt&&"string"==typeof t.createdAt&&(t.createdAt=(0,E["default"])(t.createdAt)),t.updatedAt&&"string"==typeof t.updatedAt&&(t.updatedAt=(0,E["default"])(t.updatedAt)),!t.updatedAt&&t.createdAt&&(t.updatedAt=t.createdAt),C.commitServerChanges(this.className,this._getStateIdentifier(),t)}},{key:"_setExisted",value:function(e){var t=C.getState(this.className,this._getStateIdentifier());t&&(t.existed=e)}},{key:"_migrateId",value:function(e){if(this._localId&&e){var t=C.removeState(this.className,this._getStateIdentifier());this.id=e,delete this._localId,t&&C.initializeState(this.className,this._getStateIdentifier(),t)}}},{key:"_handleSaveResponse",value:function(e,t){var r,n={},a=C.popPendingState(this.className,this._getStateIdentifier());for(r in a)a[r]instanceof T.RelationOp?n[r]=a[r].applyTo(void 0,this,r):r in e||(n[r]=a[r].applyTo(void 0));for(r in e)"createdAt"!==r&&"updatedAt"!==r||"string"!=typeof e[r]?"objectId"!==r&&(n[r]=(0,v["default"])(e[r])):n[r]=(0,E["default"])(e[r]);n.createdAt&&!n.updatedAt&&(n.updatedAt=n.createdAt),this._migrateId(e.objectId),201!==t&&this._setExisted(!0),C.commitServerChanges(this.className,this._getStateIdentifier(),n)}},{key:"_handleSaveError",value:function(){var e=this._getPendingOps();e.length>2&&C.mergeFirstPendingState(this.className,this._getStateIdentifier())}},{key:"initialize",value:function(){}},{key:"toJSON",value:function(){var e=this.id?this.className+":"+this.id:this,t={},r=this.attributes;for(var n in r)"createdAt"!==n&&"updatedAt"!==n||!r[n].toJSON?t[n]=(0,m["default"])(r[n],!1,!1,[e]):t[n]=r[n].toJSON();var a=this._getPendingOps();for(var n in a[0])t[n]=a[0][n].toJSON();return this.id&&(t.objectId=this.id),t}},{key:"equals",value:function(t){return this===t?!0:t instanceof e&&this.className===t.className&&this.id===t.id&&"undefined"!=typeof this.id}},{key:"dirty",value:function(e){if(!this.id)return!0;var t=this._getPendingOps(),r=this._getDirtyObjectAttributes();if(e){if(r.hasOwnProperty(e))return!0;for(var n=0;n<t.length;n++)if(t[n].hasOwnProperty(e))return!0;return!1}return 0!==s(t[0]).length?!0:0!==s(r).length?!0:!1}},{key:"dirtyKeys",value:function(){for(var e=this._getPendingOps(),t={},r=0;r<e.length;r++)for(var n in e[r])t[n]=!0;var a=this._getDirtyObjectAttributes();for(var n in a)t[n]=!0;return s(t)}},{key:"toPointer",value:function(){if(!this.id)throw new Error("Cannot create a pointer to an unsaved ParseObject");return{__type:"Pointer",className:this.className,objectId:this.id}}},{key:"get",value:function(e){return this.attributes[e]}},{key:"relation",value:function(e){var t=this.get(e);if(t){if(!(t instanceof U["default"]))throw new Error("Called relation() on non-relation field "+e);return t._ensureParentAndKey(this,e),t}return new U["default"](this,e)}},{key:"escape",value:function(e){var t=this.attributes[e];if(null==t)return"";if("string"!=typeof t){if("function"!=typeof t.toString)return"";t=t.toString()}return(0,w["default"])(t)}},{key:"has",value:function(e){var t=this.attributes;return t.hasOwnProperty(e)?null!=t[e]:!1}},{key:"set",value:function(e,t,r){var n={},a={};if(e&&"object"==typeof e)n=e,r=t;else{if("string"!=typeof e)return this;n[e]=t}r=r||{};var s=[];"function"==typeof this.constructor.readOnlyAttributes&&(s=s.concat(this.constructor.readOnlyAttributes()));for(var o in n)if("createdAt"!==o&&"updatedAt"!==o){if(s.indexOf(o)>-1)throw new Error("Cannot modify readonly attribute: "+o);r.unset?a[o]=new T.UnsetOp:n[o]instanceof T.Op?a[o]=n[o]:n[o]&&"object"==typeof n[o]&&"string"==typeof n[o].__op?a[o]=(0,T.opFromJSON)(n[o]):"objectId"===o||"id"===o?this.id=n[o]:"ACL"!==o||"object"!=typeof n[o]||n[o]instanceof k["default"]?a[o]=new T.SetOp(n[o]):a[o]=new T.SetOp(new k["default"](n[o]))}var i=this.attributes,u={};for(var l in a)a[l]instanceof T.RelationOp?u[l]=a[l].applyTo(i[l],this,l):a[l]instanceof T.UnsetOp||(u[l]=a[l].applyTo(i[l]));var c=this.validate(u);if(c)return"function"==typeof r.error&&r.error(this,c),!1;var f=this._getPendingOps(),d=f.length-1;for(var l in a){var h=a[l].mergeWith(f[d][l]);C.setPendingOp(this.className,this._getStateIdentifier(),l,h)}return this}},{key:"unset",value:function(e,t){return t=t||{},t.unset=!0,this.set(e,null,t)}},{key:"increment",value:function(e,t){if("undefined"==typeof t&&(t=1),"number"!=typeof t)throw new Error("Cannot increment by a non-numeric amount.");return this.set(e,new T.IncrementOp(t))}},{key:"add",value:function(e,t){return this.set(e,new T.AddOp([t]))}},{key:"addUnique",value:function(e,t){return this.set(e,new T.AddUniqueOp([t]))}},{key:"remove",value:function(e,t){return this.set(e,new T.RemoveOp([t]))}},{key:"op",value:function(e){for(var t=this._getPendingOps(),r=t.length;r--;)if(t[r][e])return t[r][e]}},{key:"clone",value:function t(){var t=new this.constructor;return t.set&&t.set(this.attributes),t.className||(t.className=this.className),t}},{key:"isNew",value:function(){return!this.id}},{key:"existed",value:function(){if(!this.id)return!1;var e=C.getState(this.className,this._getStateIdentifier());return e?e.existed:!1}},{key:"isValid",value:function(){return!this.validate(this.attributes)}},{key:"validate",value:function(e){if(e.hasOwnProperty("ACL")&&!(e.ACL instanceof k["default"]))return new j["default"](j["default"].OTHER_CAUSE,"ACL must be a Parse ACL.");for(var t in e)if(!/^[A-Za-z][0-9A-Za-z_]*$/.test(t))return new j["default"](j["default"].INVALID_KEY_NAME);return!1}},{key:"getACL",value:function(){var e=this.get("ACL");return e instanceof k["default"]?e:null}},{key:"setACL",value:function(e,t){return this.set("ACL",e,t)}},{key:"clear",value:function(){var e=this.attributes,t={},r=["createdAt","updatedAt"];"function"==typeof this.constructor.readOnlyAttributes&&(r=r.concat(this.constructor.readOnlyAttributes()));for(var n in e)r.indexOf(n)<0&&(t[n]=!0);return this.set(t,{unset:!0})}},{key:"fetch",value:function(e){e=e||{};var t={};e.hasOwnProperty("useMasterKey")&&(t.useMasterKey=e.useMasterKey),e.hasOwnProperty("sessionToken")&&(t.sessionToken=e.sessionToken);var r=d["default"].getObjectController();return r.fetch(this,!0,t)._thenRunCallbacks(e)}},{key:"save",value:function(e,t,r){var n,a,s=this;if("object"==typeof e||"undefined"==typeof e?(n=e,a=t):(n={},n[e]=t,a=r),!a&&n&&(a={},"function"==typeof n.success&&(a.success=n.success,delete n.success),"function"==typeof n.error&&(a.error=n.error,delete n.error)),n){var o=this.validate(n);if(o)return a&&"function"==typeof a.error&&a.error(this,o),M["default"].error(o);this.set(n,a)}a=a||{};var i={};a.hasOwnProperty("useMasterKey")&&(i.useMasterKey=a.useMasterKey),a.hasOwnProperty("sessionToken")&&(i.sessionToken=a.sessionToken);var u=d["default"].getObjectController(),l=(0,J["default"])(this);return u.save(l,i).then(function(){return u.save(s,i)})._thenRunCallbacks(a,this)}},{key:"destroy",value:function(e){e=e||{};var t={};return e.hasOwnProperty("useMasterKey")&&(t.useMasterKey=e.useMasterKey),e.hasOwnProperty("sessionToken")&&(t.sessionToken=e.sessionToken),this.id?d["default"].getObjectController().destroy(this,t)._thenRunCallbacks(e):M["default"].as()._thenRunCallbacks(e)}},{key:"attributes",get:function(){return o(C.estimateAttributes(this.className,this._getStateIdentifier()))}},{key:"createdAt",get:function(){return this._getServerData().createdAt}},{key:"updatedAt",get:function(){return this._getServerData().updatedAt}}],[{key:"_clearAllState",value:function(){C._clearAllState()}},{key:"fetchAll",value:function(e,t){var t=t||{},r={};return t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey),t.hasOwnProperty("sessionToken")&&(r.sessionToken=t.sessionToken),d["default"].getObjectController().fetch(e,!0,r)._thenRunCallbacks(t)}},{key:"fetchAllIfNeeded",value:function(e,t){var t=t||{},r={};return t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey),t.hasOwnProperty("sessionToken")&&(r.sessionToken=t.sessionToken),d["default"].getObjectController().fetch(e,!1,r)._thenRunCallbacks(t)}},{key:"destroyAll",value:function(e,t){var t=t||{},r={};return t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey),t.hasOwnProperty("sessionToken")&&(r.sessionToken=t.sessionToken),d["default"].getObjectController().destroy(e,r)._thenRunCallbacks(t)}},{key:"saveAll",value:function(e,t){var t=t||{},r={};return t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey),t.hasOwnProperty("sessionToken")&&(r.sessionToken=t.sessionToken),d["default"].getObjectController().save(e,r)._thenRunCallbacks(t)}},{key:"createWithoutData",value:function(e){var t=new this;return t.id=e,t}},{key:"fromJSON",value:function(t){if(!t.className)throw new Error("Cannot create an object without a className");var r=$[t.className],n=r?new r:new e(t.className),a={};for(var s in t)"className"!==s&&"__type"!==s&&(a[s]=t[s]);return n._finishFetch(a),t.objectId&&n._setExisted(!0),n}},{key:"registerSubclass",value:function(e,t){if("string"!=typeof e)throw new TypeError("The first argument must be a valid class name.");if("undefined"==typeof t)throw new TypeError("You must supply a subclass constructor.");if("function"!=typeof t)throw new TypeError("You must register the subclass constructor. Did you attempt to register an instance of the subclass?");$[e]=t,t.className||(t.className=e)}},{key:"extend",value:function(t,r,n){if("string"!=typeof t){if(t&&"string"==typeof t.className)return e.extend(t.className,t,r);throw new Error("Parse.Object.extend's first argument should be the className.")}var a=t;"User"===a&&d["default"].get("PERFORM_USER_REWRITE")&&(a="_User");var s=e.prototype;this.hasOwnProperty("__super__")&&this.__super__?s=this.prototype:$[a]&&(s=$[a].prototype);var o=function(e){if(this.className=a,this._objCount=B++,e&&"object"==typeof e&&!this.set(e||{}))throw new Error("Can't create an invalid Parse Object");"function"==typeof this.initialize&&this.initialize.apply(this,arguments)};if(o.className=a,o.__super__=s,o.prototype=i(s,{constructor:{value:o,enumerable:!1,writable:!0,configurable:!0}}),r)for(var l in r)"className"!==l&&u(o.prototype,l,{value:r[l],enumerable:!1,writable:!0,configurable:!0});if(n)for(var l in n)"className"!==l&&u(o,l,{value:n[l],enumerable:!1,writable:!0,configurable:!0});return o.extend=function(t,r,n){return"string"==typeof t?e.extend.call(o,t,r,n):e.extend.call(o,a,t,r)},o.createWithoutData=e.createWithoutData,$[a]=o,o}},{key:"enableSingleInstance",value:function(){G=!0}},{key:"disableSingleInstance",value:function(){G=!1}}]),e}();r["default"]=V,d["default"].setObjectController({fetch:function(e,t,r){if(Array.isArray(e)){if(e.length<1)return M["default"].as([]);var n=[],a=[],o=null,i=[],u=null;if(e.forEach(function(e,r){u||(o||(o=e.className),o!==e.className&&(u=new j["default"](j["default"].INVALID_CLASS_NAME,"All objects should be of the same class")),e.id||(u=new j["default"](j["default"].MISSING_OBJECT_ID,"All objects must have an ID")),(t||0===s(e._getServerData()).length)&&(a.push(e.id),n.push(e)),i.push(e))}),u)return M["default"].error(u);var l=new q["default"](o);return l.containedIn("objectId",a),l._limit=a.length,l.find(r).then(function(e){var r={};e.forEach(function(e){r[e.id]=e});for(var a=0;a<n.length;a++){var s=n[a];if((!s||!s.id||!r[s.id])&&t)return M["default"].error(new j["default"](j["default"].OBJECT_NOT_FOUND,"All objects must exist on the server."))}if(!G)for(var a=0;a<i.length;a++){var s=i[a];if(s&&s.id&&r[s.id]){var o=s.id;s._finishFetch(r[o].toJSON()),i[a]=r[o]}}return M["default"].as(i)})}var c=d["default"].getRESTController();return c.request("GET","classes/"+e.className+"/"+e._getId(),{},r).then(function(t,r,n){return e instanceof V&&(e._clearPendingOps(),e._finishFetch(t)),e})},destroy:function(e,t){var r=d["default"].getRESTController();if(Array.isArray(e)){if(e.length<1)return M["default"].as([]);var n=[[]];e.forEach(function(e){e.id&&(n[n.length-1].push(e),n[n.length-1].length>=20&&n.push([]))}),0===n[n.length-1].length&&n.pop();var a=M["default"].as(),s=[];return n.forEach(function(e){a=a.then(function(){return r.request("POST","batch",{requests:e.map(function(e){return{method:"DELETE",path:"/1/classes/"+e.className+"/"+e._getId(),body:{}}})},t).then(function(t){for(var r=0;r<t.length;r++)if(t[r]&&t[r].hasOwnProperty("error")){var n=new j["default"](t[r].error.code,t[r].error.error);n.object=e[r],s.push(n)}})})}),a.then(function(){if(s.length){var t=new j["default"](j["default"].AGGREGATE_ERROR);return t.errors=s,M["default"].error(t)}return M["default"].as(e)})}return e instanceof V?r.request("DELETE","classes/"+e.className+"/"+e._getId(),{},t).then(function(){return M["default"].as(e)}):M["default"].as(e)},save:function(e,t){var r=d["default"].getRESTController();if(Array.isArray(e)){if(e.length<1)return M["default"].as([]);for(var n=e.concat(),a=0;a<e.length;a++)e[a]instanceof V&&(n=n.concat((0,J["default"])(e[a],!0)));n=(0,F["default"])(n);var s=M["default"].as(),o=[];return n.forEach(function(e){e instanceof N["default"]?s=s.then(function(){return e.save()}):e instanceof V&&o.push(e)}),s.then(function(){var n=null;return M["default"]._continueWhile(function(){return o.length>0},function(){var e=[],a=[];if(o.forEach(function(t){e.length<20&&(0,p["default"])(t)?e.push(t):a.push(t)}),o=a,e.length<1)return M["default"].error(new j["default"](j["default"].OTHER_CAUSE,"Tried to save a batch with a cycle."));var s=new M["default"],i=[],u=[];return e.forEach(function(e,t){var r=new M["default"];i.push(r);var a=function(){return r.resolve(),s.then(function(r,a){if(r[t].hasOwnProperty("success"))e._handleSaveResponse(r[t].success,a);else{if(!n&&r[t].hasOwnProperty("error")){var s=r[t].error;n=new j["default"](s.code,s.error),o=[]}e._handleSaveError()}})};C.pushPendingState(e.className,e._getStateIdentifier()),u.push(C.enqueueTask(e.className,e._getStateIdentifier(),a))}),M["default"].when(i).then(function(){return r.request("POST","batch",{requests:e.map(function(e){var t=e._getSaveParams();return t.path="/1/"+t.path,t})},t)}).then(function(e,t,r){s.resolve(e,t)}),M["default"].when(u)}).then(function(){return n?M["default"].error(n):M["default"].as(e)})})}if(e instanceof V){var i=e,u=function(){var e=i._getSaveParams();return r.request(e.method,e.path,e.body,t).then(function(e,t){i._handleSaveResponse(e,t)},function(e){return i._handleSaveError(),M["default"].error(e)})};return C.pushPendingState(e.className,e._getStateIdentifier()),C.enqueueTask(e.className,e._getStateIdentifier(),u).then(function(){return e},function(e){return e})}return M["default"].as()}}),t.exports=r["default"]},{"./CoreManager":3,"./ObjectState":6,"./ParseACL":8,"./ParseError":10,"./ParseFile":11,"./ParseOp":15,"./ParsePromise":16,"./ParseQuery":17,"./ParseRelation":18,"./canBeSerialized":28,"./decode":29,"./encode":30,"./equals":31,"./escape":32,"./parseDate":34,"./unique":35,"./unsavedChildren":36,"babel-runtime/core-js/object/create":37,"babel-runtime/core-js/object/define-property":38,"babel-runtime/core-js/object/freeze":39,"babel-runtime/core-js/object/keys":41,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47,"babel-runtime/helpers/interop-require-wildcard":48}],15:[function(e,t,r){"use strict";function n(e){if(!e||!e.__op)return null;switch(e.__op){case"Delete":return new C;case"Increment":return new P(e.amount);case"Add":return new k((0,d["default"])(e.objects));case"AddUnique":return new A((0,d["default"])(e.objects));case"Remove":return new E((0,d["default"])(e.objects));case"AddRelation":var t=(0,d["default"])(e.objects);return Array.isArray(t)?new S(t,[]):new S([],[]);case"RemoveRelation":var r=(0,d["default"])(e.objects);return Array.isArray(r)?new S([],r):new S([],[]);case"Batch":for(var t=[],r=[],n=0;n<e.ops.length;n++)"AddRelation"===e.ops[n].__op?t=t.concat((0,d["default"])(e.ops[n].objects)):"RemoveRelation"===e.ops[n].__op&&(r=r.concat((0,d["default"])(e.ops[n].objects)));return new S(t,r)}return null}var a=e("babel-runtime/helpers/create-class")["default"],s=e("babel-runtime/helpers/class-call-check")["default"],o=e("babel-runtime/helpers/get")["default"],i=e("babel-runtime/helpers/inherits")["default"],u=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r.opFromJSON=n;var l=e("./arrayContainsObject"),c=u(l),f=e("./decode"),d=u(f),h=e("./encode"),p=u(h),y=e("./ParseObject"),v=u(y),b=e("./ParseRelation"),m=u(b),_=e("./unique"),g=u(_),w=function(){function e(){s(this,e)}return a(e,[{key:"applyTo",value:function(e){}},{key:"mergeWith",value:function(e){}},{key:"toJSON",value:function(){}}]),e}();r.Op=w;var O=function(e){function t(e){s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this._value=e}return i(t,e),a(t,[{key:"applyTo",value:function(e){return this._value}},{key:"mergeWith",value:function(e){return new t(this._value)}},{key:"toJSON",value:function(){return(0,p["default"])(this._value,!1,!0)}}]),t}(w);r.SetOp=O;var C=function(e){function t(){s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).apply(this,arguments)}return i(t,e),a(t,[{key:"applyTo",value:function(e){return void 0}},{key:"mergeWith",value:function(e){return new t}},{key:"toJSON",value:function(){return{__op:"Delete"}}}]),t}(w);r.UnsetOp=C;var P=function(e){function t(e){if(s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),"number"!=typeof e)throw new TypeError("Increment Op must be initialized with a numeric amount.");this._amount=e}return i(t,e),a(t,[{key:"applyTo",value:function(e){if("undefined"==typeof e)return this._amount;if("number"!=typeof e)throw new TypeError("Cannot increment a non-numeric value.");return this._amount+e}},{key:"mergeWith",value:function(e){if(!e)return this;if(e instanceof O)return new O(this.applyTo(e._value));if(e instanceof C)return new O(this._amount);if(e instanceof t)return new t(this.applyTo(e._amount));throw new Error("Cannot merge Increment Op with the previous Op")}},{key:"toJSON",value:function(){return{__op:"Increment",amount:this._amount}}}]),t}(w);r.IncrementOp=P;var k=function(e){function t(e){s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this._value=Array.isArray(e)?e:[e]}return i(t,e),a(t,[{key:"applyTo",value:function(e){if(null==e)return this._value;if(Array.isArray(e))return e.concat(this._value);throw new Error("Cannot add elements to a non-array value")}},{key:"mergeWith",value:function(e){if(!e)return this;if(e instanceof O)return new O(this.applyTo(e._value));if(e instanceof C)return new O(this._value);if(e instanceof t)return new t(this.applyTo(e._value));throw new Error("Cannot merge Add Op with the previous Op")}},{key:"toJSON",value:function(){return{__op:"Add",objects:(0,p["default"])(this._value,!1,!0)}}}]),t}(w);r.AddOp=k;var A=function(e){function t(e){s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this._value=(0,g["default"])(Array.isArray(e)?e:[e])}return i(t,e),a(t,[{key:"applyTo",value:function(e){if(null==e)return this._value||[];if(Array.isArray(e)){var t=e,r=[];return this._value.forEach(function(e){e instanceof v["default"]?(0,c["default"])(t,e)||r.push(e):t.indexOf(e)<0&&r.push(e)}),e.concat(r)}throw new Error("Cannot add elements to a non-array value")}},{key:"mergeWith",value:function(e){if(!e)return this;if(e instanceof O)return new O(this.applyTo(e._value));if(e instanceof C)return new O(this._value);if(e instanceof t)return new t(this.applyTo(e._value));throw new Error("Cannot merge AddUnique Op with the previous Op")}},{key:"toJSON",value:function(){return{__op:"AddUnique",objects:(0,p["default"])(this._value,!1,!0)}}}]),t}(w);r.AddUniqueOp=A;var E=function(e){function t(e){s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this._value=(0,g["default"])(Array.isArray(e)?e:[e])}return i(t,e),a(t,[{key:"applyTo",value:function(e){if(null==e)return[];if(Array.isArray(e)){for(var t=e.indexOf(this._value),r=e.concat([]),t=0;t<this._value.length;t++){for(var n=r.indexOf(this._value[t]);n>-1;)r.splice(n,1),n=r.indexOf(this._value[t]);if(this._value[t]instanceof v["default"]&&this._value[t].id)for(var a=0;a<r.length;a++)r[a]instanceof v["default"]&&this._value[t].id===r[a].id&&(r.splice(a,1),a--)}return r}throw new Error("Cannot remove elements from a non-array value")}},{key:"mergeWith",value:function(e){if(!e)return this;if(e instanceof O)return new O(this.applyTo(e._value));if(e instanceof C)return new C;if(e instanceof t){for(var r=e._value.concat([]),n=0;n<this._value.length;n++)this._value[n]instanceof v["default"]?(0,c["default"])(r,this._value[n])||r.push(this._value[n]):r.indexOf(this._value[n])<0&&r.push(this._value[n]);return new t(r)}throw new Error("Cannot merge Remove Op with the previous Op")}},{key:"toJSON",value:function(){return{__op:"Remove",objects:(0,p["default"])(this._value,!1,!0)}}}]),t}(w);r.RemoveOp=E;var S=function(e){function t(e,r){s(this,t),o(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this._targetClassName=null,Array.isArray(e)&&(this.relationsToAdd=(0,g["default"])(e.map(this._extractId,this))),Array.isArray(r)&&(this.relationsToRemove=(0,g["default"])(r.map(this._extractId,this)))}return i(t,e),a(t,[{key:"_extractId",value:function(e){if("string"==typeof e)return e;if(!e.id)throw new Error("You cannot add or remove an unsaved Parse Object from a relation");if(this._targetClassName||(this._targetClassName=e.className),this._targetClassName!==e.className)throw new Error("Tried to create a Relation with 2 different object types: "+this._targetClassName+" and "+e.className+".");return e.id}},{key:"applyTo",value:function(e,t,r){if(!e){var n=new v["default"](t.className);t.id&&0===t.id.indexOf("local")?n._localId=t.id:t.id&&(n.id=t.id);var a=new m["default"](n,r);return a.targetClassName=this._targetClassName,a}if(e instanceof m["default"]){if(this._targetClassName)if(e.targetClassName){if(this._targetClassName!==e.targetClassName)throw new Error("Related object must be a "+e.targetClassName+", but a "+this._targetClassName+" was passed in.")}else e.targetClassName=this._targetClassName;return e}throw new Error("Relation cannot be applied to a non-relation field")}},{key:"mergeWith",value:function(e){if(!e)return this;if(e instanceof C)throw new Error("You cannot modify a relation after deleting it.");if(e instanceof t){if(e._targetClassName&&e._targetClassName!==this._targetClassName)throw new Error("Related object must be of class "+e._targetClassName+", but "+(this._targetClassName||"null")+" was passed in.");var r=e.relationsToAdd.concat([]);this.relationsToRemove.forEach(function(e){var t=r.indexOf(e);t>-1&&r.splice(t,1)}),this.relationsToAdd.forEach(function(e){var t=r.indexOf(e);0>t&&r.push(e)});var n=e.relationsToRemove.concat([]);this.relationsToAdd.forEach(function(e){var t=n.indexOf(e);t>-1&&n.splice(t,1)}),this.relationsToRemove.forEach(function(e){var t=n.indexOf(e);0>t&&n.push(e)});var a=new t(r,n);return a._targetClassName=this._targetClassName,a}throw new Error("Cannot merge Relation Op with the previous Op")}},{key:"toJSON",value:function(){var e=this,t=function(t){return{__type:"Pointer",className:e._targetClassName,objectId:t}},r=null,n=null,a=null;return this.relationsToAdd.length>0&&(a=this.relationsToAdd.map(t),r={__op:"AddRelation",objects:a}),this.relationsToRemove.length>0&&(a=this.relationsToRemove.map(t),n={__op:"RemoveRelation",objects:a}),r&&n?{__op:"Batch",ops:[r,n]}:r||n||{}}}]),t}(w);r.RelationOp=S},{"./ParseObject":14,"./ParseRelation":18,"./arrayContainsObject":27,"./decode":29,"./encode":30,"./unique":35,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/get":45,"babel-runtime/helpers/inherits":46,"babel-runtime/helpers/interop-require-default":47}],16:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/create-class")["default"],a=e("babel-runtime/helpers/class-call-check")["default"];Object.defineProperty(r,"__esModule",{value:!0});var s=!1,o=function(){function e(){a(this,e),this._resolved=!1,this._rejected=!1,this._resolvedCallbacks=[],this._rejectedCallbacks=[]}return n(e,[{key:"resolve",value:function(){if(this._resolved||this._rejected)throw new Error("A promise was resolved even though it had already been "+(this._resolved?"resolved":"rejected")+".");this._resolved=!0;for(var e=arguments.length,t=Array(e),r=0;e>r;r++)t[r]=arguments[r];this._result=t;for(var n=0;n<this._resolvedCallbacks.length;n++)this._resolvedCallbacks[n].apply(this,t);this._resolvedCallbacks=[],this._rejectedCallbacks=[]}},{key:"reject",value:function(e){if(this._resolved||this._rejected)throw new Error("A promise was resolved even though it had already been "+(this._resolved?"resolved":"rejected")+".");this._rejected=!0,this._error=e;for(var t=0;t<this._rejectedCallbacks.length;t++)this._rejectedCallbacks[t](e);this._resolvedCallbacks=[],this._rejectedCallbacks=[]}},{key:"then",value:function(t,r){var n=this,a=new e,s=function(){for(var r=arguments.length,n=Array(r),s=0;r>s;s++)n[s]=arguments[s];"function"==typeof t&&(n=[t.apply(this,n)]),1===n.length&&e.is(n[0])?n[0].then(function(){a.resolve.apply(a,arguments)},function(e){a.reject(e)}):a.resolve.apply(a,n)},o=function(t){var n=[];"function"==typeof r?(n=[r(t)],1===n.length&&e.is(n[0])?n[0].then(function(){a.resolve.apply(a,arguments)},function(e){a.reject(e)}):a.reject(n[0])):a.reject(t)},i=function(e){e.call()};return this._resolved?i(function(){s.apply(n,n._result)}):this._rejected?i(function(){o(n._error)}):(this._resolvedCallbacks.push(s),this._rejectedCallbacks.push(o)),a}},{key:"always",value:function(e){return this.then(e,e)}},{key:"done",value:function(e){return this.then(e)}},{key:"fail",value:function(e){return this.then(null,e)}},{key:"_thenRunCallbacks",value:function(t,r){var n={};return"function"==typeof t?(n.success=function(e){t(e,null)},n.error=function(e){t(null,e)}):"object"==typeof t&&("function"==typeof t.success&&(n.success=t.success),"function"==typeof t.error&&(n.error=t.error)),this.then(function(){for(var t=arguments.length,r=Array(t),a=0;t>a;a++)r[a]=arguments[a];return n.success&&n.success.apply(this,r),e.as.apply(e,arguments)},function(t){return n.error&&("undefined"!=typeof r?n.error(r,t):n.error(t)),e.error(t)})}},{key:"_continueWith",value:function(e){return this.then(function(){return e(arguments,null)},function(t){return e(null,t)})}}],[{key:"is",value:function(e){return"undefined"!=typeof e&&"function"==typeof e.then}},{key:"as",value:function(){for(var t=new e,r=arguments.length,n=Array(r),a=0;r>a;a++)n[a]=arguments[a];return t.resolve.apply(t,n),t}},{key:"error",value:function(){for(var t=new e,r=arguments.length,n=Array(r),a=0;r>a;a++)n[a]=arguments[a];return t.reject.apply(t,n),t}},{key:"when",value:function(t){var r;r=Array.isArray(t)?t:arguments;var n=r.length,a=!1,s=[],o=[];if(s.length=r.length,o.length=r.length,0===n)return e.as.apply(this,s);for(var i=new e,u=function(){n--,0>=n&&(a?i.reject(o):i.resolve.apply(i,s))},l=function(t,r){e.is(t)?t.then(function(e){s[r]=e,u()},function(e){o[r]=e,a=!0,u()}):(s[c]=t,u())},c=0;c<r.length;c++)l(r[c],c);return i}},{key:"_continueWhile",value:function(t,r){return t()?r().then(function(){return e._continueWhile(t,r)}):e.as()}},{key:"isPromisesAPlusCompliant",value:function(){return s}}]),e}();r["default"]=o,t.exports=r["default"]},{"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44}],17:[function(e,t,r){"use strict";function n(e){return"\\Q"+e.replace("\\E","\\E\\\\E\\Q")+"\\E"}var a=e("babel-runtime/helpers/create-class")["default"],s=e("babel-runtime/helpers/class-call-check")["default"],o=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var i=e("./CoreManager"),u=o(i),l=e("./encode"),c=o(l),f=e("./ParseError"),d=o(f),h=e("./ParseGeoPoint"),p=o(h),y=e("./ParseObject"),v=o(y),b=e("./ParsePromise"),m=o(b),_=function(){function e(t){if(s(this,e),"string"==typeof t)"User"===t&&u["default"].get("PERFORM_USER_REWRITE")?this.className="_User":this.className=t;else if(t instanceof v["default"])this.className=t.className;else{if("function"!=typeof t)throw new TypeError("A ParseQuery must be constructed with a ParseObject or class name.");if("string"==typeof t.className)this.className=t.className;else{var r=new t;this.className=r.className}}this._where={},this._include=[],this._limit=-1,this._skip=0,this._extraOptions={}}return a(e,[{key:"_orQuery",value:function(e){var t=e.map(function(e){return e.toJSON().where});return this._where.$or=t,this}},{key:"_addCondition",value:function(e,t,r){return this._where[e]&&"string"!=typeof this._where[e]||(this._where[e]={}),this._where[e][t]=(0,c["default"])(r,!1,!0),this}},{key:"toJSON",value:function(){var e={where:this._where};this._include.length&&(e.include=this._include.join(",")),this._select&&(e.keys=this._select.join(",")),this._limit>=0&&(e.limit=this._limit),this._skip>0&&(e.skip=this._skip),this._order&&(e.order=this._order.join(","));for(var t in this._extraOptions)e[t]=this._extraOptions[t];return e}},{key:"get",value:function(e,t){this.equalTo("objectId",e);var r={};return t&&t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey),t&&t.hasOwnProperty("sessionToken")&&(r.sessionToken=t.sessionToken),this.first(r).then(function(e){if(e)return e;var t=new d["default"](d["default"].OBJECT_NOT_FOUND,"Object not found.");return m["default"].error(t)})._thenRunCallbacks(t,null)}},{key:"find",value:function(e){var t=this;e=e||{};var r={};e.hasOwnProperty("useMasterKey")&&(r.useMasterKey=e.useMasterKey),e.hasOwnProperty("sessionToken")&&(r.sessionToken=e.sessionToken);var n=u["default"].getQueryController();return n.find(this.className,this.toJSON(),r).then(function(e){return e.results.map(function(e){return e.className=t.className,v["default"].fromJSON(e)})})._thenRunCallbacks(e)}},{key:"count",value:function(e){
e=e||{};var t={};e.hasOwnProperty("useMasterKey")&&(t.useMasterKey=e.useMasterKey),e.hasOwnProperty("sessionToken")&&(t.sessionToken=e.sessionToken);var r=u["default"].getQueryController(),n=this.toJSON();return n.limit=0,n.count=1,r.find(this.className,n,t).then(function(e){return e.count})._thenRunCallbacks(e)}},{key:"first",value:function(e){var t=this;e=e||{};var r={};e.hasOwnProperty("useMasterKey")&&(r.useMasterKey=e.useMasterKey),e.hasOwnProperty("sessionToken")&&(r.sessionToken=e.sessionToken);var n=u["default"].getQueryController(),a=this.toJSON();return a.limit=1,n.find(this.className,a,r).then(function(e){var r=e.results;return r[0]?(r[0].className=t.className,v["default"].fromJSON(r[0])):void 0})._thenRunCallbacks(e)}},{key:"each",value:function(t,r){if(r=r||{},this._order||this._skip||this._limit>=0)return m["default"].error("Cannot iterate on a query with sort, skip, or limit.")._thenRunCallbacks(r);var n=(new m["default"],new e(this.className));n._limit=r.batchSize||100,n._include=this._include.map(function(e){return e}),this._select&&(n._select=this._select.map(function(e){return e})),n._where={};for(var a in this._where){var s=this._where[a];if(Array.isArray(s))n._where[a]=s.map(function(e){return e});else if(s&&"object"==typeof s){var o={};n._where[a]=o;for(var i in s)o[i]=s[i]}else n._where[a]=s}n.ascending("objectId");var u={};r.hasOwnProperty("useMasterKey")&&(u.useMasterKey=r.useMasterKey),r.hasOwnProperty("sessionToken")&&(u.sessionToken=r.sessionToken);var l=!1;return m["default"]._continueWhile(function(){return!l},function(){return n.find(u).then(function(e){var r=m["default"].as();return e.forEach(function(e){r=r.then(function(){return t(e)})}),r.then(function(){e.length>=n._limit?n.greaterThan("objectId",e[e.length-1].id):l=!0})})})._thenRunCallbacks(r)}},{key:"equalTo",value:function(e,t){return"undefined"==typeof t?this.doesNotExist(e):(this._where[e]=(0,c["default"])(t,!1,!0),this)}},{key:"notEqualTo",value:function(e,t){return this._addCondition(e,"$ne",t)}},{key:"lessThan",value:function(e,t){return this._addCondition(e,"$lt",t)}},{key:"greaterThan",value:function(e,t){return this._addCondition(e,"$gt",t)}},{key:"lessThanOrEqualTo",value:function(e,t){return this._addCondition(e,"$lte",t)}},{key:"greaterThanOrEqualTo",value:function(e,t){return this._addCondition(e,"$gte",t)}},{key:"containedIn",value:function(e,t){return this._addCondition(e,"$in",t)}},{key:"notContainedIn",value:function(e,t){return this._addCondition(e,"$nin",t)}},{key:"containsAll",value:function(e,t){return this._addCondition(e,"$all",t)}},{key:"exists",value:function(e){return this._addCondition(e,"$exists",!0)}},{key:"doesNotExist",value:function(e){return this._addCondition(e,"$exists",!1)}},{key:"matches",value:function(e,t,r){return this._addCondition(e,"$regex",t),r||(r=""),t.ignoreCase&&(r+="i"),t.multiline&&(r+="m"),r.length&&this._addCondition(e,"$options",r),this}},{key:"matchesQuery",value:function(e,t){var r=t.toJSON();return r.className=t.className,this._addCondition(e,"$inQuery",r)}},{key:"doesNotMatchQuery",value:function(e,t){var r=t.toJSON();return r.className=t.className,this._addCondition(e,"$notInQuery",r)}},{key:"matchesKeyInQuery",value:function(e,t,r){var n=r.toJSON();return n.className=r.className,this._addCondition(e,"$select",{key:t,query:n})}},{key:"doesNotMatchKeyInQuery",value:function(e,t,r){var n=r.toJSON();return n.className=r.className,this._addCondition(e,"$dontSelect",{key:t,query:n})}},{key:"contains",value:function(e,t){if("string"!=typeof t)throw new Error("The value being searched for must be a string.");return this._addCondition(e,"$regex",n(t))}},{key:"startsWith",value:function(e,t){if("string"!=typeof t)throw new Error("The value being searched for must be a string.");return this._addCondition(e,"$regex","^"+n(t))}},{key:"endsWith",value:function(e,t){if("string"!=typeof t)throw new Error("The value being searched for must be a string.");return this._addCondition(e,"$regex",n(t)+"$")}},{key:"near",value:function(e,t){return t instanceof p["default"]||(t=new p["default"](t)),this._addCondition(e,"$nearSphere",t)}},{key:"withinRadians",value:function(e,t,r){return this.near(e,t),this._addCondition(e,"$maxDistance",r)}},{key:"withinMiles",value:function(e,t,r){return this.withinRadians(e,t,r/3958.8)}},{key:"withinKilometers",value:function(e,t,r){return this.withinRadians(e,t,r/6371)}},{key:"withinGeoBox",value:function(e,t,r){return t instanceof p["default"]||(t=new p["default"](t)),r instanceof p["default"]||(r=new p["default"](r)),this._addCondition(e,"$within",{$box:[t,r]}),this}},{key:"ascending",value:function(){this._order=[];for(var e=arguments.length,t=Array(e),r=0;e>r;r++)t[r]=arguments[r];return this.addAscending.apply(this,t)}},{key:"addAscending",value:function(){var e=this;this._order||(this._order=[]);for(var t=arguments.length,r=Array(t),n=0;t>n;n++)r[n]=arguments[n];return r.forEach(function(t){Array.isArray(t)&&(t=t.join()),e._order=e._order.concat(t.replace(/\s/g,"").split(","))}),this}},{key:"descending",value:function(){this._order=[];for(var e=arguments.length,t=Array(e),r=0;e>r;r++)t[r]=arguments[r];return this.addDescending.apply(this,t)}},{key:"addDescending",value:function(){var e=this;this._order||(this._order=[]);for(var t=arguments.length,r=Array(t),n=0;t>n;n++)r[n]=arguments[n];return r.forEach(function(t){Array.isArray(t)&&(t=t.join()),e._order=e._order.concat(t.replace(/\s/g,"").split(",").map(function(e){return"-"+e}))}),this}},{key:"skip",value:function(e){if("number"!=typeof e||0>e)throw new Error("You can only skip by a positive number");return this._skip=e,this}},{key:"limit",value:function(e){if("number"!=typeof e)throw new Error("You can only set the limit to a numeric value");return this._limit=e,this}},{key:"include",value:function(){for(var e=this,t=arguments.length,r=Array(t),n=0;t>n;n++)r[n]=arguments[n];return r.forEach(function(t){Array.isArray(t)?e._include=e._include.concat(t):e._include.push(t)}),this}},{key:"select",value:function(){var e=this;this._select||(this._select=[]);for(var t=arguments.length,r=Array(t),n=0;t>n;n++)r[n]=arguments[n];return r.forEach(function(t){Array.isArray(t)?e._select=e._select.concat(t):e._select.push(t)}),this}}],[{key:"or",value:function(){for(var t=null,r=arguments.length,n=Array(r),a=0;r>a;a++)n[a]=arguments[a];n.forEach(function(e){if(t||(t=e.className),t!==e.className)throw new Error("All queries must be for the same class.")});var s=new e(t);return s._orQuery(n),s}}]),e}();r["default"]=_,u["default"].setQueryController({find:function(e,t,r){var n=u["default"].getRESTController();return n.request("GET","classes/"+e,t,r)}}),t.exports=r["default"]},{"./CoreManager":3,"./ParseError":10,"./ParseGeoPoint":12,"./ParseObject":14,"./ParsePromise":16,"./encode":30,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],18:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/create-class")["default"],a=e("babel-runtime/helpers/class-call-check")["default"],s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var o=e("./ParseOp"),i=e("./ParseObject"),u=(s(i),e("./ParseQuery")),l=s(u),c=function(){function e(t,r){a(this,e),this.parent=t,this.key=r,this.targetClassName=null}return n(e,[{key:"_ensureParentAndKey",value:function(e,t){if(this.key=this.key||t,this.key!==t)throw new Error("Internal Error. Relation retrieved from two different keys.");if(this.parent){if(this.parent.className!==e.className)throw new Error("Internal Error. Relation retrieved from two different Objects.");if(this.parent.id){if(this.parent.id!==e.id)throw new Error("Internal Error. Relation retrieved from two different Objects.")}else e.id&&(this.parent=e)}else this.parent=e}},{key:"add",value:function(e){Array.isArray(e)||(e=[e]);var t=new o.RelationOp(e,[]);return this.parent.set(this.key,t),this.targetClassName=t._targetClassName,this.parent}},{key:"remove",value:function(e){Array.isArray(e)||(e=[e]);var t=new o.RelationOp([],e);this.parent.set(this.key,t),this.targetClassName=t._targetClassName}},{key:"toJSON",value:function(){return{__type:"Relation",className:this.targetClassName}}},{key:"query",value:function t(){var t;return this.targetClassName?t=new l["default"](this.targetClassName):(t=new l["default"](this.parent.className),t._extraOptions.redirectClassNameForKey=this.key),t._addCondition("$relatedTo","object",{__type:"Pointer",className:this.parent.className,objectId:this.parent.id}),t._addCondition("$relatedTo","key",this.key),t}}]),e}();r["default"]=c,t.exports=r["default"]},{"./ParseObject":14,"./ParseOp":15,"./ParseQuery":17,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],19:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/get")["default"],a=e("babel-runtime/helpers/inherits")["default"],s=e("babel-runtime/helpers/create-class")["default"],o=e("babel-runtime/helpers/class-call-check")["default"],i=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var u=e("./ParseACL"),l=i(u),c=e("./ParseError"),f=i(c),d=e("./ParseObject"),h=i(d),p=function(e){function t(e,r){o(this,t),n(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,"_Role"),"string"==typeof e&&r instanceof l["default"]&&(this.setName(e),this.setACL(r))}return a(t,e),s(t,[{key:"getName",value:function(){return this.get("name")}},{key:"setName",value:function(e,t){return this.set("name",e,t)}},{key:"getUsers",value:function(){return this.relation("users")}},{key:"getRoles",value:function(){return this.relation("roles")}},{key:"validate",value:function(e,r){var a=n(Object.getPrototypeOf(t.prototype),"validate",this).call(this,e,r);if(a)return a;if("name"in e&&e.name!==this.getName()){var s=e.name;if(this.id&&this.id!==e.objectId)return new f["default"](f["default"].OTHER_CAUSE,"A role's name can only be set before it has been saved.");if("string"!=typeof s)return new f["default"](f["default"].OTHER_CAUSE,"A role's name must be a String.");if(!/^[0-9a-zA-Z\-_ ]+$/.test(s))return new f["default"](f["default"].OTHER_CAUSE,"A role's name can be only contain alphanumeric characters, _, -, and spaces.")}return!1}}]),t}(h["default"]);r["default"]=p,h["default"].registerSubclass("_Role",p),t.exports=r["default"]},{"./ParseACL":8,"./ParseError":10,"./ParseObject":14,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/get":45,"babel-runtime/helpers/inherits":46,"babel-runtime/helpers/interop-require-default":47}],20:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/get")["default"],a=e("babel-runtime/helpers/inherits")["default"],s=e("babel-runtime/helpers/create-class")["default"],o=e("babel-runtime/helpers/class-call-check")["default"],i=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var u=e("./CoreManager"),l=i(u),c=e("./isRevocableSession"),f=i(c),d=e("./ParseObject"),h=i(d),p=e("./ParsePromise"),y=i(p),v=e("./ParseUser"),b=i(v),m=function(e){function t(e){if(o(this,t),n(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,"_Session"),e&&"object"==typeof e&&!this.set(e||{}))throw new Error("Can't create an invalid Session")}return a(t,e),s(t,[{key:"getSessionToken",value:function(){return this.get("sessionToken")}}],[{key:"readOnlyAttributes",value:function(){return["createdWith","expiresAt","installationId","restricted","sessionToken","user"]}},{key:"current",value:function(e){e=e||{};var t=l["default"].getSessionController(),r={};return e.hasOwnProperty("useMasterKey")&&(r.useMasterKey=e.useMasterKey),b["default"].currentAsync().then(function(e){if(!e)return y["default"].error("There is no current user.");e.getSessionToken();return r.sessionToken=e.getSessionToken(),t.getSession(r)})}},{key:"isCurrentSessionRevocable",value:function(){var e=b["default"].current();return e?(0,f["default"])(e.getSessionToken()||""):!1}}]),t}(h["default"]);r["default"]=m,h["default"].registerSubclass("_Session",m),l["default"].setSessionController({getSession:function(e){var t=l["default"].getRESTController(),r=new m;return t.request("GET","sessions/me",{},e).then(function(e){return r._finishFetch(e),r._setExisted(!0),r})}}),t.exports=r["default"]},{"./CoreManager":3,"./ParseObject":14,"./ParsePromise":16,"./ParseUser":21,"./isRevocableSession":33,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/get":45,"babel-runtime/helpers/inherits":46,"babel-runtime/helpers/interop-require-default":47}],21:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/get")["default"],a=e("babel-runtime/helpers/inherits")["default"],s=e("babel-runtime/helpers/create-class")["default"],o=e("babel-runtime/helpers/class-call-check")["default"],i=e("babel-runtime/core-js/object/define-property")["default"],u=e("babel-runtime/helpers/interop-require-default")["default"],l=e("babel-runtime/helpers/interop-require-wildcard")["default"];Object.defineProperty(r,"__esModule",{value:!0});var c=e("./CoreManager"),f=u(c),d=e("./isRevocableSession"),h=u(d),p=e("./ObjectState"),y=l(p),v=e("./ParseError"),b=u(v),m=e("./ParseObject"),_=u(m),g=e("./ParsePromise"),w=u(g),O=e("./ParseSession"),C=u(O),P=e("./Storage"),k=u(P),A="currentUser",E=!f["default"].get("IS_NODE"),S=!1,j=null,I={},N=function(e){function t(e){if(o(this,t),n(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,"_User"),e&&"object"==typeof e&&!this.set(e||{}))throw new Error("Can't create an invalid Parse User")}return a(t,e),s(t,[{key:"_upgradeToRevocableSession",value:function(e){e=e||{};var t={};e.hasOwnProperty("useMasterKey")&&(t.useMasterKey=e.useMasterKey);var r=f["default"].getUserController();return r.upgradeToRevocableSession(this,t)._thenRunCallbacks(e)}},{key:"_linkWith",value:function(e,t){var r,n=this;if("string"==typeof e?(r=e,e=I[e]):r=e.getAuthType(),t&&t.hasOwnProperty("authData")){var a=this.get("authData")||{};a[r]=t.authData;var s=f["default"].getUserController();return s.linkWith(this,a)._thenRunCallbacks(t,this)}var o=new w["default"];return e.authenticate({success:function(e,r){var a={};a.authData=r,t.success&&(a.success=t.success),t.error&&(a.error=t.error),n._linkWith(e,a).then(function(){o.resolve(n)},function(e){o.reject(e)})},error:function(e,r){t.error&&t.error(n,r),o.reject(r)}}),o}},{key:"_synchronizeAuthData",value:function(e){if(this.isCurrent()&&e){var t;"string"==typeof e?(t=e,e=I[t]):t=e.getAuthType();var r=this.get("authData");if(e&&"object"==typeof r){var n=e.restoreAuthentication(r[t]);n||this._unlinkFrom(e)}}}},{key:"_synchronizeAllAuthData",value:function(){var e=this.get("authData");if("object"==typeof e)for(var t in e)this._synchronizeAuthData(t)}},{key:"_cleanupAuthData",value:function(){if(this.isCurrent()){var e=this.get("authData");if("object"==typeof e)for(var t in e)e[t]||delete e[t]}}},{key:"_unlinkFrom",value:function(e,t){var r,n=this;return"string"==typeof e?(r=e,e=I[e]):r=e.getAuthType(),this._linkWith(e,{authData:null}).then(function(){return n._synchronizeAuthData(e),w["default"].as(n)})._thenRunCallbacks(t)}},{key:"_isLinked",value:function(e){var t;t="string"==typeof e?e:e.getAuthType();var r=this.get("authData")||{};return!!r[t]}},{key:"_logOutWithAll",value:function(){var e=this.get("authData");if("object"==typeof e)for(var t in e)this._logOutWith(t)}},{key:"_logOutWith",value:function(e){this.isCurrent()&&("string"==typeof e&&(e=I[e]),e&&e.deauthenticate&&e.deauthenticate())}},{key:"isCurrent",value:function(){var e=t.current();return!!e&&e.id===this.id}},{key:"getUsername",value:function(){return this.get("username")}},{key:"setUsername",value:function(e){this.set("username",e)}},{key:"setPassword",value:function(e){this.set("password",e)}},{key:"getEmail",value:function(){return this.get("email")}},{key:"setEmail",value:function(e){this.set("email",e)}},{key:"getSessionToken",value:function(){return this.get("sessionToken")}},{key:"authenticated",value:function(){var e=t.current();return!!this.get("sessionToken")&&!!e&&e.id===this.id}},{key:"signUp",value:function(e,t){t=t||{};var r={};t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey);var n=f["default"].getUserController();return n.signUp(this,e,r)._thenRunCallbacks(t,this)}},{key:"logIn",value:function(e){e=e||{};var t={};e.hasOwnProperty("useMasterKey")&&(t.useMasterKey=e.useMasterKey);var r=f["default"].getUserController();return r.logIn(this,t)._thenRunCallbacks(e,this)}}],[{key:"readOnlyAttributes",value:function(){return["sessionToken"]}},{key:"extend",value:function(e,r){if(e)for(var n in e)"className"!==n&&i(t.prototype,n,{value:e[n],enumerable:!1,writable:!0,configurable:!0});if(r)for(var n in r)"className"!==n&&i(t,n,{value:r[n],enumerable:!1,writable:!0,configurable:!0});return t}},{key:"current",value:function(){if(!E)return null;var e=f["default"].getUserController();return e.currentUser()}},{key:"currentAsync",value:function(){if(!E)return w["default"].as(null);var e=f["default"].getUserController();return e.currentUserAsync()}},{key:"signUp",value:function(e,r,n,a){n=n||{},n.username=e,n.password=r;var s=new t(n);return s.signUp({},a)}},{key:"logIn",value:function(e,r,n){var a=new t;return a._finishFetch({username:e,password:r}),a.logIn(n)}},{key:"become",value:function(e,t){if(!E)throw new Error("It is not memory-safe to become a user in a server environment");t=t||{};var r={sessionToken:e};t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey);var n=f["default"].getUserController();return n.become(r)._thenRunCallbacks(t)}},{key:"logInWith",value:function(e,r){return t._logInWith(e,r)}},{key:"logOut",value:function(){if(!E)throw new Error("There is no current user user on a node.js server environment.");var e=f["default"].getUserController();return e.logOut()}},{key:"requestPasswordReset",value:function(e,t){t=t||{};var r={};t.hasOwnProperty("useMasterKey")&&(r.useMasterKey=t.useMasterKey);var n=f["default"].getUserController();return n.requestPasswordReset(e,r)._thenRunCallbacks(t)}},{key:"allowCustomUserClass",value:function(e){f["default"].set("PERFORM_USER_REWRITE",!e)}},{key:"enableRevocableSession",value:function(e){if(e=e||{},f["default"].set("FORCE_REVOCABLE_SESSION",!0),E){var r=t.current();if(r)return r._upgradeToRevocableSession(e)}return w["default"].as()._thenRunCallbacks(e)}},{key:"enableUnsafeCurrentUser",value:function(){E=!0}},{key:"disableUnsafeCurrentUser",value:function(){E=!1}},{key:"_registerAuthenticationProvider",value:function(e){I[e.getAuthType()]=e;var r=t.current();r&&r._synchronizeAuthData(e.getAuthType())}},{key:"_logInWith",value:function(e,r){var n=new t;return n._linkWith(e,r)}},{key:"_clearCache",value:function(){j=null,S=!1}},{key:"_setCurrentUserCache",value:function(e){j=e}}]),t}(_["default"]);r["default"]=N,_["default"].registerSubclass("_User",N);var T={setCurrentUser:function(e){j=e,e._cleanupAuthData(),e._synchronizeAllAuthData();var t=k["default"].generatePath(A),r=e.toJSON();return r.className="_User",k["default"].setItemAsync(t,JSON.stringify(r)).then(function(){return e})},currentUser:function(){if(j)return j;if(S)return null;if(k["default"].async())throw new Error("Cannot call currentUser() when using a platform with an async storage system. Call currentUserAsync() instead.");var e=k["default"].generatePath(A),t=k["default"].getItem(e);if(S=!0,!t)return j=null,null;t=JSON.parse(t),t.className||(t.className="_User"),t._id&&(t.objectId!==t._id&&(t.objectId=t._id),delete t._id),t._sessionToken&&(t.sessionToken=t._sessionToken,delete t._sessionToken);var r=N.fromJSON(t);return j=r,r._synchronizeAllAuthData(),r},currentUserAsync:function(){if(j)return w["default"].as(j);if(S)return w["default"].as(null);var e=k["default"].generatePath(A);return k["default"].getItemAsync(e).then(function(e){if(S=!0,!e)return j=null,w["default"].as(null);e=JSON.parse(e),e.className||(e.className="_User"),e._id&&(e.objectId!==e._id&&(e.objectId=e._id),delete e._id),e._sessionToken&&(e.sessionToken=e._sessionToken,delete e._sessionToken);var t=N.fromJSON(e);return j=t,t._synchronizeAllAuthData(),w["default"].as(t)})},signUp:function(e,t,r){var n=t&&t.username||e.get("username"),a=t&&t.password||e.get("password");return n&&n.length?a&&a.length?e.save(t,r).then(function(){return e._finishFetch({password:void 0}),E?T.setCurrentUser(e):e}):w["default"].error(new b["default"](b["default"].OTHER_CAUSE,"Cannot sign up user with an empty password.")):w["default"].error(new b["default"](b["default"].OTHER_CAUSE,"Cannot sign up user with an empty name."))},logIn:function(e,t){var r=f["default"].getRESTController(),n={username:e.get("username"),password:e.get("password")};return r.request("GET","login",n,t).then(function(t,r){return e._migrateId(t.objectId),e._setExisted(!0),y.setPendingOp(e.className,e._getId(),"username",void 0),y.setPendingOp(e.className,e._getId(),"password",void 0),t.password=void 0,e._finishFetch(t),E?T.setCurrentUser(e):w["default"].as(e)})},become:function(e){var t=new N,r=f["default"].getRESTController();return r.request("GET","users/me",{},e).then(function(e,r){return t._finishFetch(e),t._setExisted(!0),T.setCurrentUser(t)})},logOut:function(){return T.currentUserAsync().then(function(e){var t=k["default"].generatePath(A),r=k["default"].removeItemAsync(t),n=f["default"].getRESTController();if(null!==e){var a=e.getSessionToken();a&&(0,h["default"])(a)&&r.then(function(){return n.request("POST","logout",{},{sessionToken:a})}),e._logOutWithAll(),e._finishFetch({sessionToken:void 0})}return S=!0,j=null,r})},requestPasswordReset:function(e,t){var r=f["default"].getRESTController();return r.request("POST","requestPasswordReset",{email:e},t)},upgradeToRevocableSession:function(e,t){var r=e.getSessionToken();if(!r)return w["default"].error(new b["default"](b["default"].SESSION_MISSING,"Cannot upgrade a user with no session token"));t.sessionToken=r;var n=f["default"].getRESTController();return n.request("POST","upgradeToRevocableSession",{},t).then(function(t){var r=new C["default"];return r._finishFetch(t),e._finishFetch({sessionToken:r.getSessionToken()}),e.isCurrent()?T.setCurrentUser(e):w["default"].as(e)})},linkWith:function(e,t){return e.save({authData:t}).then(function(){return E?T.setCurrentUser(e):e})}};f["default"].setUserController(T),t.exports=r["default"]},{"./CoreManager":3,"./ObjectState":6,"./ParseError":10,"./ParseObject":14,"./ParsePromise":16,"./ParseSession":20,"./Storage":24,"./isRevocableSession":33,"babel-runtime/core-js/object/define-property":38,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/get":45,"babel-runtime/helpers/inherits":46,"babel-runtime/helpers/interop-require-default":47,"babel-runtime/helpers/interop-require-wildcard":48}],22:[function(e,t,r){"use strict";function n(e,t){if(t=t||{},e.where&&e.where instanceof u["default"]&&(e.where=e.where.toJSON().where),e.push_time&&"object"==typeof e.push_time&&(e.push_time=e.push_time.toJSON()),e.expiration_time&&"object"==typeof e.expiration_time&&(e.expiration_time=e.expiration_time.toJSON()),e.expiration_time&&e.expiration_interval)throw new Error("expiration_time and expiration_interval cannot both be set.");return o["default"].getPushController().send(e,{useMasterKey:t.useMasterKey})._thenRunCallbacks(t)}var a=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r.send=n;var s=e("./CoreManager"),o=a(s),i=e("./ParseQuery"),u=a(i);o["default"].setPushController({send:function(e,t){var r=o["default"].getRESTController(),n=r.request("POST","push",e,{useMasterKey:!!t.useMasterKey});return n._thenRunCallbacks(t)}})},{"./CoreManager":3,"./ParseQuery":17,"babel-runtime/helpers/interop-require-default":47}],23:[function(e,t,r){(function(n){"use strict";function a(e,t,r){var n=new f["default"],a=new XDomainRequest;return a.onload=function(){var e;try{e=JSON.parse(a.responseText)}catch(t){n.reject(t)}n.resolve(e)},a.onerror=a.ontimeout=function(){var e={responseText:JSON.stringify({code:l["default"].X_DOMAIN_REQUEST,error:"IE's XDomainRequest does not supply error info."})};n.reject(e)},a.onprogress=function(){},a.open(e,t),a.send(r),n}var s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var o=e("./CoreManager"),i=s(o),u=e("./ParseError"),l=s(u),c=e("./ParsePromise"),f=s(c),d=e("./Storage"),h=(s(d),null);"undefined"!=typeof XMLHttpRequest&&(h=XMLHttpRequest);var p=!1;"undefined"==typeof XDomainRequest||"withCredentials"in new XMLHttpRequest||(p=!0);var y={ajax:function(e,t,r,s){if(p)return a(e,t,r,s);var o=new f["default"],u=0,l=function c(){if(null==h)throw new Error("Cannot make a request: No definition of XMLHttpRequest was found.");var a=!1,l=new h;l.onreadystatechange=function(){if(4===l.readyState&&!a)if(a=!0,l.status>=200&&l.status<300){var e;try{e=JSON.parse(l.responseText)}catch(t){o.reject(t)}o.resolve(e,l.status,l)}else if(l.status>=500)if(++u<i["default"].get("REQUEST_ATTEMPT_LIMIT")){var r=Math.round(125*Math.random()*Math.pow(2,u));setTimeout(c,r)}else o.reject(l);else o.reject(l)},s=s||{},s["Content-Type"]="text/plain",i["default"].get("IS_NODE")&&(s["User-Agent"]="Parse/"+i["default"].get("VERSION")+" (NodeJS "+n.versions.node+")"),l.open(e,t,!0);for(var f in s)l.setRequestHeader(f,s[f]);l.send(r)};return l(),o},request:function(e,t,r,n){n=n||{};var a=i["default"].get("SERVER_URL");a+="/1/"+t;var s={};if(r&&"object"==typeof r)for(var o in r)s[o]=r[o];"POST"!==e&&(s._method=e,e="POST"),s._ApplicationId=i["default"].get("APPLICATION_ID"),s._JavaScriptKey=i["default"].get("JAVASCRIPT_KEY"),s._ClientVersion="js"+i["default"].get("VERSION");var u=n.useMasterKey;if("undefined"==typeof u&&(u=i["default"].get("USE_MASTER_KEY")),u){if(!i["default"].get("MASTER_KEY"))throw new Error("Cannot use the Master Key, it has not been provided.");delete s._JavaScriptKey,s._MasterKey=i["default"].get("MASTER_KEY")}i["default"].get("FORCE_REVOCABLE_SESSION")&&(s._RevocableSession="1");var c=i["default"].getInstallationController();return c.currentInstallationId().then(function(e){s._InstallationId=e;var t=i["default"].getUserController();return n&&"string"==typeof n.sessionToken?f["default"].as(n.sessionToken):t?t.currentUserAsync().then(function(e){return e?f["default"].as(e.getSessionToken()):f["default"].as(null)}):f["default"].as(null)}).then(function(t){t&&(s._SessionToken=t);var r=JSON.stringify(s);return y.ajax(e,a,r)}).then(null,function(e){var t;if(e&&e.responseText)try{var r=JSON.parse(e.responseText);t=new l["default"](r.code,r.error)}catch(n){t=new l["default"](l["default"].INVALID_JSON,"Received an error with invalid JSON from Parse: "+e.responseText)}else t=new l["default"](l["default"].CONNECTION_FAILED,"XMLHttpRequest failed: "+JSON.stringify(e));return f["default"].error(t)})},_setXHR:function(e){h=e}};t.exports=y}).call(this,e("_process"))},{"./CoreManager":3,"./ParseError":10,"./ParsePromise":16,"./Storage":24,_process:49,"babel-runtime/helpers/interop-require-default":47}],24:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/interop-require-default")["default"],a=e("./CoreManager"),s=n(a),o=e("./ParsePromise"),i=n(o);t.exports={async:function(){var e=s["default"].getStorageController();return!!e.async},getItem:function(e){var t=s["default"].getStorageController();if(1===t.async)throw new Error("Synchronous storage is not supported by the current storage controller");return t.getItem(e)},getItemAsync:function(e){var t=s["default"].getStorageController();return 1===t.async?t.getItemAsync(e):i["default"].as(t.getItem(e))},setItem:function(e,t){var r=s["default"].getStorageController();if(1===r.async)throw new Error("Synchronous storage is not supported by the current storage controller");return r.setItem(e,t)},setItemAsync:function(e,t){var r=s["default"].getStorageController();return 1===r.async?r.setItemAsync(e,t):i["default"].as(r.setItem(e,t))},removeItem:function(e){var t=s["default"].getStorageController();if(1===t.async)throw new Error("Synchronous storage is not supported by the current storage controller");return t.removeItem(e)},removeItemAsync:function(e){var t=s["default"].getStorageController();return 1===t.async?t.removeItemAsync(e):i["default"].as(t.removeItem(e))},generatePath:function(e){if(!s["default"].get("APPLICATION_ID"))throw new Error("You need to call Parse.initialize before using Parse.");if("string"!=typeof e)throw new Error("Tried to get a Storage path that was not a String.");return"/"===e[0]&&(e=e.substr(1)),"Parse/"+s["default"].get("APPLICATION_ID")+"/"+e},_clear:function(){var e=s["default"].getStorageController();e.hasOwnProperty("clear")&&e.clear()}},s["default"].setStorageController(e("./StorageController.browser"))},{"./CoreManager":3,"./ParsePromise":16,"./StorageController.browser":25,"babel-runtime/helpers/interop-require-default":47}],25:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/interop-require-default")["default"],a=e("./ParsePromise");n(a);t.exports={async:0,getItem:function(e){return localStorage.getItem(e)},setItem:function(e,t){localStorage.setItem(e,t)},removeItem:function(e){localStorage.removeItem(e)},clear:function(){localStorage.clear()}}},{"./ParsePromise":16,"babel-runtime/helpers/interop-require-default":47}],26:[function(e,t,r){"use strict";var n=e("babel-runtime/helpers/create-class")["default"],a=e("babel-runtime/helpers/class-call-check")["default"],s=e("babel-runtime/helpers/interop-require-default")["default"],o=e("./ParsePromise"),i=s(o);t.exports=function(){function e(){a(this,e),this.queue=[]}return n(e,[{key:"enqueue",value:function(e){var t=this,r=new i["default"];return this.queue.push({task:e,_completion:r}),1===this.queue.length&&e().then(function(){t._dequeue(),r.resolve()},function(e){t._dequeue(),r.reject(e)}),r}},{key:"_dequeue",value:function(){var e=this;if(this.queue.shift(),this.queue.length){var t=this.queue[0];t.task().then(function(){e._dequeue(),t._completion.resolve()},function(r){e._dequeue(),t._completion.reject(r)})}}}]),e}()},{"./ParsePromise":16,"babel-runtime/helpers/class-call-check":43,"babel-runtime/helpers/create-class":44,"babel-runtime/helpers/interop-require-default":47}],27:[function(e,t,r){"use strict";function n(e,t){if(e.indexOf(t)>-1)return!0;for(var r=0;r<e.length;r++)if(e[r]instanceof o["default"]&&e[r].className===t.className&&e[r]._getId()===t._getId())return!0;return!1}var a=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n;var s=e("./ParseObject"),o=a(s);t.exports=r["default"]},{"./ParseObject":14,"babel-runtime/helpers/interop-require-default":47}],28:[function(e,t,r){"use strict";function n(e){if(!(e instanceof l["default"]))return!0;var t=e.attributes;for(var r in t){var n=t[r];if(!a(n))return!1}return!0}function a(e){if("object"!=typeof e)return!0;if(e instanceof f["default"])return!0;if(e instanceof l["default"])return!!e.id;if(e instanceof i["default"])return e.url()?!0:!1;if(Array.isArray(e)){for(var t=0;t<e.length;t++)if(!a(e[t]))return!1;return!0}for(var r in e)if(!a(e[r]))return!1;return!0}var s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n;var o=e("./ParseFile"),i=s(o),u=e("./ParseObject"),l=s(u),c=e("./ParseRelation"),f=s(c);t.exports=r["default"]},{"./ParseFile":11,"./ParseObject":14,"./ParseRelation":18,"babel-runtime/helpers/interop-require-default":47}],29:[function(e,t,r){"use strict";function n(e){if(null===e||"object"!=typeof e)return e;if(Array.isArray(e)){var t=[];return e.forEach(function(e,r){t[r]=n(e)}),t}if("string"==typeof e.__op)return(0,
d.opFromJSON)(e);if("Pointer"===e.__type&&e.className)return f["default"].fromJSON(e);if("Object"===e.__type&&e.className)return f["default"].fromJSON(e);if("Relation"===e.__type){var r=new p["default"](null,null);return r.targetClassName=e.className,r}if("Date"===e.__type)return new Date(e.iso);if("File"===e.__type)return i["default"].fromJSON(e);if("GeoPoint"===e.__type)return new l["default"]({latitude:e.latitude,longitude:e.longitude});var a={};for(var s in e)a[s]=n(e[s]);return a}var a=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n;var s=e("./ParseACL"),o=(a(s),e("./ParseFile")),i=a(o),u=e("./ParseGeoPoint"),l=a(u),c=e("./ParseObject"),f=a(c),d=e("./ParseOp"),h=e("./ParseRelation"),p=a(h);t.exports=r["default"]},{"./ParseACL":8,"./ParseFile":11,"./ParseGeoPoint":12,"./ParseObject":14,"./ParseOp":15,"./ParseRelation":18,"babel-runtime/helpers/interop-require-default":47}],30:[function(e,t,r){"use strict";function n(e,t,r,s){if(e instanceof h["default"]){if(t)throw new Error("Parse Objects not allowed here");var o=e.id?e.className+":"+e.id:e;if(r||!s||s.indexOf(o)>-1||e.dirty()||a(e._getServerData()).length<1)return e.toPointer();s=s.concat(o);var u=n(e.attributes,t,r,s);return u.createdAt&&(u.createdAt=u.createdAt.iso),u.updatedAt&&(u.updatedAt=u.updatedAt.iso),u.className=e.className,u.__type="Object",e.id&&(u.objectId=e.id),u}if(e instanceof p.Op||e instanceof i["default"]||e instanceof f["default"]||e instanceof v["default"])return e.toJSON();if(e instanceof l["default"]){if(!e.url())throw new Error("Tried to encode an unsaved file.");return e.toJSON()}if("[object Date]"===b.call(e)){if(isNaN(e))throw new Error("Tried to encode an invalid date.");return{__type:"Date",iso:e.toJSON()}}if("[object RegExp]"===b.call(e)&&"string"==typeof e.source)return e.source;if(Array.isArray(e))return e.map(function(e){return n(e,t,r,s)});if(e&&"object"==typeof e){var c={};for(var d in e)c[d]=n(e[d],t,r,s);return c}return e}var a=e("babel-runtime/core-js/object/keys")["default"],s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0});var o=e("./ParseACL"),i=s(o),u=e("./ParseFile"),l=s(u),c=e("./ParseGeoPoint"),f=s(c),d=e("./ParseObject"),h=s(d),p=e("./ParseOp"),y=e("./ParseRelation"),v=s(y),b=Object.prototype.toString;r["default"]=function(e,t,r,a){return n(e,!!t,!!r,a||[])},t.exports=r["default"]},{"./ParseACL":8,"./ParseFile":11,"./ParseGeoPoint":12,"./ParseObject":14,"./ParseOp":15,"./ParseRelation":18,"babel-runtime/core-js/object/keys":41,"babel-runtime/helpers/interop-require-default":47}],31:[function(e,t,r){"use strict";function n(e,t){if(typeof e!=typeof t)return!1;if(!e||"object"!=typeof e)return e===t;if(Array.isArray(e)||Array.isArray(t)){if(!Array.isArray(e)||!Array.isArray(t))return!1;if(e.length!==t.length)return!1;for(var r=e.length;r--;)if(!n(e[r],t[r]))return!1;return!0}if(e instanceof i["default"]||e instanceof l["default"]||e instanceof f["default"]||e instanceof h["default"])return e.equals(t);if(a(e).length!==a(t).length)return!1;for(var s in e)if(!n(e[s],t[s]))return!1;return!0}var a=e("babel-runtime/core-js/object/keys")["default"],s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n;var o=e("./ParseACL"),i=s(o),u=e("./ParseFile"),l=s(u),c=e("./ParseGeoPoint"),f=s(c),d=e("./ParseObject"),h=s(d);t.exports=r["default"]},{"./ParseACL":8,"./ParseFile":11,"./ParseGeoPoint":12,"./ParseObject":14,"babel-runtime/core-js/object/keys":41,"babel-runtime/helpers/interop-require-default":47}],32:[function(e,t,r){"use strict";function n(e){return e.replace(/[&<>\/'"]/g,function(e){return{"&":"&amp;","<":"&lt;",">":"&gt;","/":"&#x2F;","'":"&#x27;",'"':"&quot;"}[e]})}Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n,t.exports=r["default"]},{}],33:[function(e,t,r){"use strict";function n(e){return e.indexOf("r:")>-1}Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n,t.exports=r["default"]},{}],34:[function(e,t,r){"use strict";function n(e){var t=new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})T([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})(.([0-9]+))?Z$"),r=t.exec(e);if(!r)return null;var n=r[1]||0,a=(r[2]||1)-1,s=r[3]||0,o=r[4]||0,i=r[5]||0,u=r[6]||0,l=r[8]||0;return new Date(Date.UTC(n,a,s,o,i,u,l))}Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n,t.exports=r["default"]},{}],35:[function(e,t,r){"use strict";function n(e){var t=[];return e.forEach(function(e){e instanceof u["default"]?(0,o["default"])(t,e)||t.push(e):t.indexOf(e)<0&&t.push(e)}),t}var a=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n;var s=e("./arrayContainsObject"),o=a(s),i=e("./ParseObject"),u=a(i);t.exports=r["default"]},{"./ParseObject":14,"./arrayContainsObject":27,"babel-runtime/helpers/interop-require-default":47}],36:[function(e,t,r){"use strict";function n(e,t){var r={objects:{},files:[]},n=e.className+":"+e._getId();r.objects[n]=e.dirty()?e:!0;var s=e.attributes;for(var o in s)"object"==typeof s[o]&&a(s[o],r,!1,!!t);var i=[];for(var u in r.objects)u!==n&&r.objects[u]!==!0&&i.push(r.objects[u]);return i.concat(r.files)}function a(e,t,r,n){if(e instanceof l["default"]){if(!e.id&&r)throw new Error("Cannot create a pointer to an unsaved Object.");var s=e.className+":"+e._getId();if(!t.objects[s]){t.objects[s]=e.dirty()?e:!0;var o=e.attributes;for(var u in o)"object"==typeof o[u]&&a(o[u],t,!n,n)}}else{if(e instanceof i["default"])return void(!e.url()&&t.files.indexOf(e)<0&&t.files.push(e));if(!(e instanceof f["default"])){Array.isArray(e)&&e.forEach(function(e){a(e,t,r,n)});for(var c in e)"object"==typeof e[c]&&a(e[c],t,r,n)}}}var s=e("babel-runtime/helpers/interop-require-default")["default"];Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=n;var o=e("./ParseFile"),i=s(o),u=e("./ParseObject"),l=s(u),c=e("./ParseRelation"),f=s(c);t.exports=r["default"]},{"./ParseFile":11,"./ParseObject":14,"./ParseRelation":18,"babel-runtime/helpers/interop-require-default":47}],37:[function(e,t,r){t.exports={"default":e("core-js/library/fn/object/create"),__esModule:!0}},{"core-js/library/fn/object/create":50}],38:[function(e,t,r){t.exports={"default":e("core-js/library/fn/object/define-property"),__esModule:!0}},{"core-js/library/fn/object/define-property":51}],39:[function(e,t,r){t.exports={"default":e("core-js/library/fn/object/freeze"),__esModule:!0}},{"core-js/library/fn/object/freeze":52}],40:[function(e,t,r){t.exports={"default":e("core-js/library/fn/object/get-own-property-descriptor"),__esModule:!0}},{"core-js/library/fn/object/get-own-property-descriptor":53}],41:[function(e,t,r){t.exports={"default":e("core-js/library/fn/object/keys"),__esModule:!0}},{"core-js/library/fn/object/keys":54}],42:[function(e,t,r){t.exports={"default":e("core-js/library/fn/object/set-prototype-of"),__esModule:!0}},{"core-js/library/fn/object/set-prototype-of":55}],43:[function(e,t,r){"use strict";r["default"]=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},r.__esModule=!0},{}],44:[function(e,t,r){"use strict";var n=e("babel-runtime/core-js/object/define-property")["default"];r["default"]=function(){function e(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),n(e,a.key,a)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),r.__esModule=!0},{"babel-runtime/core-js/object/define-property":38}],45:[function(e,t,r){"use strict";var n=e("babel-runtime/core-js/object/get-own-property-descriptor")["default"];r["default"]=function(e,t,r){for(var a=!0;a;){var s=e,o=t,i=r;u=c=l=void 0,a=!1,null===s&&(s=Function.prototype);var u=n(s,o);if(void 0!==u){if("value"in u)return u.value;var l=u.get;return void 0===l?void 0:l.call(i)}var c=Object.getPrototypeOf(s);if(null===c)return void 0;e=c,t=o,r=i,a=!0}},r.__esModule=!0},{"babel-runtime/core-js/object/get-own-property-descriptor":40}],46:[function(e,t,r){"use strict";var n=e("babel-runtime/core-js/object/create")["default"],a=e("babel-runtime/core-js/object/set-prototype-of")["default"];r["default"]=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=n(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(a?a(e,t):e.__proto__=t)},r.__esModule=!0},{"babel-runtime/core-js/object/create":37,"babel-runtime/core-js/object/set-prototype-of":42}],47:[function(e,t,r){"use strict";r["default"]=function(e){return e&&e.__esModule?e:{"default":e}},r.__esModule=!0},{}],48:[function(e,t,r){"use strict";r["default"]=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t["default"]=e,t},r.__esModule=!0},{}],49:[function(e,t,r){},{}],50:[function(e,t,r){var n=e("../../modules/$");t.exports=function(e,t){return n.create(e,t)}},{"../../modules/$":67}],51:[function(e,t,r){var n=e("../../modules/$");t.exports=function(e,t,r){return n.setDesc(e,t,r)}},{"../../modules/$":67}],52:[function(e,t,r){e("../../modules/es6.object.freeze"),t.exports=e("../../modules/$.core").Object.freeze},{"../../modules/$.core":59,"../../modules/es6.object.freeze":72}],53:[function(e,t,r){var n=e("../../modules/$");e("../../modules/es6.object.get-own-property-descriptor"),t.exports=function(e,t){return n.getDesc(e,t)}},{"../../modules/$":67,"../../modules/es6.object.get-own-property-descriptor":73}],54:[function(e,t,r){e("../../modules/es6.object.keys"),t.exports=e("../../modules/$.core").Object.keys},{"../../modules/$.core":59,"../../modules/es6.object.keys":74}],55:[function(e,t,r){e("../../modules/es6.object.set-prototype-of"),t.exports=e("../../modules/$.core").Object.setPrototypeOf},{"../../modules/$.core":59,"../../modules/es6.object.set-prototype-of":75}],56:[function(e,t,r){t.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},{}],57:[function(e,t,r){var n=e("./$.is-object");t.exports=function(e){if(!n(e))throw TypeError(e+" is not an object!");return e}},{"./$.is-object":66}],58:[function(e,t,r){var n={}.toString;t.exports=function(e){return n.call(e).slice(8,-1)}},{}],59:[function(e,t,r){var n=t.exports={version:"1.2.1"};"number"==typeof __e&&(__e=n)},{}],60:[function(e,t,r){var n=e("./$.a-function");t.exports=function(e,t,r){if(n(e),void 0===t)return e;switch(r){case 1:return function(r){return e.call(t,r)};case 2:return function(r,n){return e.call(t,r,n)};case 3:return function(r,n,a){return e.call(t,r,n,a)}}return function(){return e.apply(t,arguments)}}},{"./$.a-function":56}],61:[function(e,t,r){var n=e("./$.global"),a=e("./$.core"),s="prototype",o=function(e,t){return function(){return e.apply(t,arguments)}},i=function(e,t,r){var u,l,c,f,d=e&i.G,h=e&i.P,p=d?n:e&i.S?n[t]:(n[t]||{})[s],y=d?a:a[t]||(a[t]={});d&&(r=t);for(u in r)l=!(e&i.F)&&p&&u in p,l&&u in y||(c=l?p[u]:r[u],d&&"function"!=typeof p[u]?f=r[u]:e&i.B&&l?f=o(c,n):e&i.W&&p[u]==c?!function(e){f=function(t){return this instanceof e?new e(t):e(t)},f[s]=e[s]}(c):f=h&&"function"==typeof c?o(Function.call,c):c,y[u]=f,h&&((y[s]||(y[s]={}))[u]=c))};i.F=1,i.G=2,i.S=4,i.P=8,i.B=16,i.W=32,t.exports=i},{"./$.core":59,"./$.global":64}],62:[function(e,t,r){t.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},{}],63:[function(e,t,r){t.exports=function(e){try{return!!e()}catch(t){return!0}}},{}],64:[function(e,t,r){var n="undefined",a=t.exports=typeof window!=n&&window.Math==Math?window:typeof self!=n&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=a)},{}],65:[function(e,t,r){var n=e("./$.cof");t.exports=0 in Object("z")?Object:function(e){return"String"==n(e)?e.split(""):Object(e)}},{"./$.cof":58}],66:[function(e,t,r){t.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},{}],67:[function(e,t,r){var n=Object;t.exports={create:n.create,getProto:n.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:n.getOwnPropertyDescriptor,setDesc:n.defineProperty,setDescs:n.defineProperties,getKeys:n.keys,getNames:n.getOwnPropertyNames,getSymbols:n.getOwnPropertySymbols,each:[].forEach}},{}],68:[function(e,t,r){t.exports=function(t,r){var n=e("./$.def"),a=(e("./$.core").Object||{})[t]||Object[t],s={};s[t]=r(a),n(n.S+n.F*e("./$.fails")(function(){a(1)}),"Object",s)}},{"./$.core":59,"./$.def":61,"./$.fails":63}],69:[function(e,t,r){var n=e("./$").getDesc,a=e("./$.is-object"),s=e("./$.an-object"),o=function(e,t){if(s(e),!a(t)&&null!==t)throw TypeError(t+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,r,a){try{a=e("./$.ctx")(Function.call,n(Object.prototype,"__proto__").set,2),a(t,[]),r=!(t instanceof Array)}catch(s){r=!0}return function(e,t){return o(e,t),r?e.__proto__=t:a(e,t),e}}({},!1):void 0),check:o}},{"./$":67,"./$.an-object":57,"./$.ctx":60,"./$.is-object":66}],70:[function(e,t,r){var n=e("./$.iobject"),a=e("./$.defined");t.exports=function(e){return n(a(e))}},{"./$.defined":62,"./$.iobject":65}],71:[function(e,t,r){var n=e("./$.defined");t.exports=function(e){return Object(n(e))}},{"./$.defined":62}],72:[function(e,t,r){var n=e("./$.is-object");e("./$.object-sap")("freeze",function(e){return function(t){return e&&n(t)?e(t):t}})},{"./$.is-object":66,"./$.object-sap":68}],73:[function(e,t,r){var n=e("./$.to-iobject");e("./$.object-sap")("getOwnPropertyDescriptor",function(e){return function(t,r){return e(n(t),r)}})},{"./$.object-sap":68,"./$.to-iobject":70}],74:[function(e,t,r){var n=e("./$.to-object");e("./$.object-sap")("keys",function(e){return function(t){return e(n(t))}})},{"./$.object-sap":68,"./$.to-object":71}],75:[function(e,t,r){var n=e("./$.def");n(n.S,"Object",{setPrototypeOf:e("./$.set-proto").set})},{"./$.def":61,"./$.set-proto":69}]},{},[7])(7)});
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
      console.log("fetching")
      cordovaUtil.syncCoordinates();
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
               console.log($scope.GDouglasPeucker(pathArr,5))
                $scope.paths={
                     p1: {
                color: '#008000',
                weight: 8,
                latlngs:$scope.GDouglasPeucker(pathArr,5)
                }

               }
           }
            }) 
    });
    
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

