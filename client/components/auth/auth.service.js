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

  var fetchUser=function(){
    var deffered= $q.defer();
    //if in cache
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
              fetchUser().then(function(userData){
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
      getCurrentUser: function() {
        var deffered=$q.defer();        
        fetchUser().then(function(user){
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
          if(user)
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
