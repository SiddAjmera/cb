'use strict';

angular.module('cbApp')
  .factory('User', function ($resource) {
    return $resource('http://172.29.181.56:9000/api/users/:id/:controller', {
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
