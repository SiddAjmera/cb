'use strict';

angular.module('cbApp')
  .factory('Auth', function Auth($location, $rootScope, User,$q,httpRequest,localStorage) {
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
  });
