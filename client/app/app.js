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
  /*'ngTouch',*/
  'slick',
  'ui.bootstrap',
  'ngHamburger',
  'LocalForageModule'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
     console.log("In config block")
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

    Parse.initialize("oMdH0Ybh26y7Zz8chStjWBmK3ST9wA6hNQ7vrHZ3", "vYmfAKeYOTb7Hau3COS7xIFPeObQ8QAiBlxJR2Eb");

  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location,$localForage) {
    return {
      // Add authorization token to headers
      request: function (config) {
        var deferred = $q.defer();

        config.headers = config.headers || {};
        $localForage.getItem('token').
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
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth,localStorage) {
    console.log("In run block")
     //logic to check if app is already initialized

    if(localStorage.isInitialized()){

    }
       //  $location.path('/login');
    else{
        localStorage.initialize();
        $location.path('/intro');
    }

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        console.log("loggedIn",loggedIn);
         console.log("next",next);
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

/*var onDeviceReady = function() {
	saveDeviceInfo();
    angular.bootstrap( document, ['cbApp']);
}
document.addEventListener('deviceready', 
onDeviceReady);
*/