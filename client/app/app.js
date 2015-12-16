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
  /*'ngTouch',
  'angular-carousel',*/
  'ui.bootstrap',
  'ngHamburger',
  'LocalForageModule'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
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
        config.headers = config.headers || {};
       /* $localForage.getItem('token').
        then(function(res){
          if(res.token)
             config.headers.Authorization = 'Bearer ' + res.token;
          return config;
        });*/

        if($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }

         return config;
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

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
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