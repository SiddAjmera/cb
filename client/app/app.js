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

.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider,cfpLoadingBarProvider) {
     console.log("In config block");

    $urlRouterProvider
      .otherwise('/userHome/home');

  //  $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    cfpLoadingBarProvider.includeSpinner = false;

  })

  .factory('authInterceptor', function ($rootScope, $q,$location,localStorage) {
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
               $location.path('/userHome/home');
            else{
              localStorage.initialize();
              //$location.path('/intro');
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
