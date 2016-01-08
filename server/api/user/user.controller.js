'use strict';

var User = require('./user.model');
var Team = require('../team/team.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var q= require('q');
var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user. This will be used to SingUp a new User. This returns an access token that can be userd to log the user in right after signup.
 */
exports.create = function (req, res, next) {
  console.log('User requested to create a new account with data : ' + JSON.stringify(req.body) );
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {

    
    if(err){
        console.log('Error creating a User. Here is the error ', err);
        return validationError(res, err);
     }
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

// Get the teams of the Current User

// Here the req.body should contain { "empId" : 987654 or something }
exports.teamsOfCurrentUser = function(req, res){
  console.log('Got request to get Team Details of Current User');
  var teamIDsForCurrentUser = User.find( req.body, { _id: 1 } );
  console.log('Team IDs for Current User : ' + teamIDsForCurrentUser);
};

// This will return an array of Users with the specified office and home address
exports.getSuggestions = function(req, res){
  console.log('Got request to get suggestions. Here is the request body : ' + req.body );
  User.find().where("officeAddress", req.body.officeAddress)
             .where("homeAddress", req.body.homeAddress)
             .exec(function(err, users) {
    if(err) { return handleError(res, err); }
    return res.json(200, users);
  });
}


exports.suggestionsTest = function(req, res){
  console.log('Got request to get suggestions. Here is the request body : ' + req.body );
  
}
/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

exports.regIdsForOtherUsers = function(userId){
  var redgIds = [];
  var deffered=q.defer();
  User.find({userId: {$nin: [userId]}}, 'redgId', function(err, regIds){
    if(err){
      console.log('Error Getting regIdsForOtherUsers. Error : ' + JSON.stringify(err));
      deffered.reject(err)
    } 
    else{
      regIds.forEach(function(value, index, ar){
        if(value.redgId)  redgIds.push(value.redgId);
      });
      deffered.resolve(redgIds)
    }
    console.log(JSON.stringify(redgIds));
  });
  return deffered.promise;
};
/**
 * Get my info
 */
exports.me = function(req, res, next) {
  // console.log('This is the request body in me : ' + JSON.stringify(req));
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
