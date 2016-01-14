'use strict';

var User = require('./user.model');
var Team = require('../team/team.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var q= require('q');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  logger.trace(req.user.userId + ' requested for User.Index');
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err){
      logger.fatal('Error in User.Index. Error : ' + err);
      return res.send(500, err);
    }
    if(!users){
        logger.error('Error in User.Index. Error : Not Found');
        return res.send(404);
    }
    logger.debug('Successfully got Users in User.Index');
    res.json(200, users);
  });
};

/**
 * Creates a new user. This will be used to SingUp a new User. This returns an access token that can be userd to log the user in right after signup.
 */
exports.create = function (req, res, next) {
  logger.trace(req.user.userId + ' requested for User.create');
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {  
    if(err){
        logger.fatal('Error in User.create. Error : ' + err);
        return validationError(res, err);
    }
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    logger.debug('Successfully created Users in User.create');
    res.json({ token: token });
  });
};

// Get the teams of the Current User

// Here the req.body should contain { "empId" : 987654 or something }
exports.teamsOfCurrentUser = function(req, res){
  logger.trace(req.user.userId + ' requested for User.teamsOfCurrentUser');
  var teamIDsForCurrentUser = User.find( req.body, { _id: 1 } );
};

// This will return an array of Users with the specified office and home address
exports.getSuggestions = function(req, res){
  logger.trace(req.user.userId + ' requested for User.getSuggestions');
  User.find().where("officeAddress", req.body.officeAddress)
             .where("homeAddress", req.body.homeAddress)
             .exec(function(err, users) {
    if(err) {
      logger.fatal('Error in User.getSuggestions. Error : ' + err);
      return handleError(res, err);
    }
    if(!users){
      logger.error('Error in User.getSuggestions. Error : Not Found');
      return res.send(404);
    }
    logger.debug('Successfully got Users in User.getSuggestions');
    return res.json(200, users);
  });
}


exports.suggestionsTest = function(req, res){
  logger.trace(req.user.userId + ' requested for User.suggestionsTest');
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  logger.trace(req.user.userId + ' requested for User.show');
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) {
      logger.fatal('Error in User.show. Error : ' + err);
      return next(err);
    }
    if (!user){
      logger.error('Error in User.show. Error : Not Found');
      return res.send(401);
    }
    logger.debug('Successfully got User in User.show');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  logger.trace(req.user.userId + ' requested for User.destroy');
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) {
      logger.fatal('Error in User.destroy. Error : ' + err);
      return res.send(500, err);
    }
    logger.debug('Successfully destroyed User in User.destroy');
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  logger.trace(req.user.userId + ' requested for User.changePassword');
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) {
          logger.fatal('Error in User.changePassword. Error : ' + err);
          return validationError(res, err);
        }
        logger.debug('Successfully Changed password for User in User.changePassword');
        res.send(200);
      });
    } else {
      logger.fatal('Error in User.changePassword. Error Code: 403');
      res.send(403);
    }
  });
};

exports.regIdsForOtherUsers = function(userId){
  logger.trace(req.user.userId + ' requested for User.regIdsForOtherUsers');
  var redgIds = [];
  var deffered=q.defer();
  User.find({userId: {$nin: [userId]}}, 'redgId', function(err, regIds){
    if(err){
      logger.fatal('Error in User.regIdsForOtherUsers. Error : ' + err);
      deffered.reject(err)
    } 
    else{
      regIds.forEach(function(value, index, ar){
        if(value.redgId)  redgIds.push(value.redgId);
      });
      logger.debug('Successfully got RedgIds for Users in User.regIdsForOtherUsers');
      deffered.resolve(redgIds)
    }
  });
  return deffered.promise;
};

exports.nameByUserId = function(userId){
  logger.trace(req.user.userId + ' requested for User.nameByUserId');
  var deffered=q.defer();
  User.find({userId: userId}, 'empName', function(err, empName){
    if(err){
      logger.fatal('Error in User.nameByUserId. Error : ' + err);
      deffered.reject(err)
    } 
    else{
      logger.debug('Successfully got Name for User in User.nameByUserId');
      deffered.resolve(empName[0].empName);
    }
  });
  return deffered.promise;
};


// To get a list of Users specifying the following
/*{
    "userIds" : [111111, 111112],
    "fieldsRequired" : {
        "empId" : 1,
        "empName" : 1,
        "contactNo" : 1,
        "gender" : 1,
        "homeAddress" : 1,
        "city" : 1,
        "state" : 1,
        "officeAddress" : 1,
        "timeSlot" : 1,
        "redgId" : 1,
        "userId" : 1,
        "userPhotoUrl" : 1,
        "email" : 1
    }
}*/
exports.getUsers = function(req, res){
  logger.trace(req.user.userId + ' requested for User.getUsers');
  User.find({userId: {$in: req.body.userIds }}, req.body.fieldsRequired, function(err, users){
    if(err){
      logger.fatal('Error in User.getUsers. Error : ' + err);
      return res.send(404, err);
    }
    if (!user){
      logger.error('Error in User.getUsers. Error : Not Found');
      return res.send(401);
    }
    logger.debug('Successfully got Users in User.getUsers');
    res.json(200, users);
  });
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  logger.trace(req.user.userId + ' requested for User.me');
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) {
      logger.fatal('Error in User.me. Error : ' + err);
      return next(err);
    }
    if (!user){
      logger.error('Error in User.getUsers. Error : Unauthorized');
      return res.json(401);
    }
    logger.debug('Successfully got User in User.me');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
