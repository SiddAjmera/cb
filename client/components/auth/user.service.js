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
