'use strict';
var mongoose = require('mongoose')
var User = require('./user.model');
var Team = require('../team/team.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var q= require('q');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

var turf = require('turf');
var driveString = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "LineString"/*,
    "coordinates": [
      [-77.031669, 38.878605],
      [-77.029609, 38.881946],
      [-77.020339, 38.884084],
      [-77.025661, 38.885821],
      [-77.021884, 38.889563],
      [-77.019824, 38.892368]
    ]*/
  }
};

var CurrentUser;

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.Index');
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
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.create');
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

// Updates an existing User in the DB. This will be Used for Update Profile and Other Things
exports.update = function(req, res) {
  logger.trace(req.user.empId + ' requested for User.update');
  if(req.body._id) { delete req.body._id; }
  User.findById(req.params.id, function (err, user) {
    if (err) {
     logger.fatal('Error in User.update. Error : ' + err);
     return handleError(res, err); 
    }
    if(!user) { 
      logger.error('Error in User.update. Error : Not Found');
      return res.send(404); 
    }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { 
        logger.fatal('Error in User.update.updated.save. Error : ' + err);
        return handleError(res, err); 
      }
      logger.debug('Successfully updated user in User.update');
      return res.json(200, user);
    });
  });
};

// Get the teams of the Current User. Here the req.body should contain { "empId" : 987654 or something }
exports.teamsOfCurrentUser = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.teamsOfCurrentUser');
  var teamIDsForCurrentUser = User.find( req.body, { _id: 1 } );
};

// This will return an array of Users who are near this User's Home i.e. People in a User's 1km Radius
exports.getSuggestions = function(req, res){
  CurrentUser = req.user;
  var empId = req.user.empId;
  logger.trace(empId + ' requested for User.getSuggestions');
  /*User.find().where("officeAddress", req.body.officeAddress)
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
  });*/
  User.findOne( { empId: empId }, function(err, user){
    if(err) {
      logger.fatal('Error in User.getSuggestions. Error : ' + err);
      return handleError(res, err);
    }
    if(!user){
      logger.error('Error in User.getSuggestions. Error : Not Found');
      return res.send(404);
    }

    /*User.find( { 
                 "homeAddressLocation.location" : { '$near' : user.homeAddressLocation.location },
                 "userId"                       : { $ne: userId }
               })
        .limit(2)
        .exec(function(err, users){
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
        });*/




    /*mongoose.connection.db.executeDbCommand({ 
      geoNear             : "users",                            // the mongo collection
      near                : user.homeAddressLocation.location,  // the geo point
      spherical           : true,                               // tell mongo the earth is round, so it calculates based on a spherical location system
      distanceMultiplier  : 6371,                               // tell mongo how many radians go into one kilometer.
      maxDistance         : 1/6371,                             // tell mongo the max distance in radians to filter out
      userId              : { ne : userId }
    }, function(err, result) {
      //console.log(result.documents[0].results);
      if(err) {
              logger.fatal('Error in User.getSuggestions. Error : ' + err);
              return handleError(res, err);
            }
            if(!users){
              logger.error('Error in User.getSuggestions. Error : Not Found');
              return res.send(404);
            }
            logger.debug('Successfully got Users in User.getSuggestions');
            return res.json(200, result.documents[0].results);
    }); */


    User.geoNear( 
      user.homeAddressLocation.location,
      {
          spherical           : true,            // tell mongo the earth is round, so it calculates based on a spherical location system
          distanceMultiplier  : 6371,            // tell mongo how many radians go into one kilometer.
          //maxDistance         : 1/6371,        // tell mongo the max distance in radians to filter out
          empId              : { $ne : empId }
      },function(err, results, stats){
          if(err) {
            logger.fatal('Error in User.getSuggestions. Error : ' + err);
            return handleError(res, err);
          }
          if(!results){
            logger.error('Error in User.getSuggestions. Error : Not Found');
            return res.send(404);
          }
          logger.debug('Successfully got Users in User.getSuggestions');
          console.log('Results', results);
          return res.json(200, results);
      });
  });
};


exports.suggestionsTest = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.suggestionsTest');
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.show');
  var user_Id = req.params.id;
  User.findById(user_Id, function (err, user) {
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
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.destroy');
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
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.changePassword');
  var user_Id = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(user_Id, function (err, user) {
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

exports.regIdsForOtherUsers = function(empId){
  logger.trace(empId + ' requested for User.regIdsForOtherUsers');
  var redgIds = [];
  var deffered=q.defer();
  User.find({empId: {$nin: [empId]}}, 'redgId', function(err, regIds){
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

exports.nameByUserId = function(empId){
  logger.trace(CurrentUser.empId + ' requested for User.nameByUserId');
  var deffered = q.defer();
  User.findOne({empId: empId}, 'empName', function(err, empName){
    if(err){
      logger.fatal('Error in User.nameByUserId. Error : ' + err);
      deffered.reject(err)
    } 
    else{
      logger.debug('Successfully got Name for User in User.nameByUserId');
      deffered.resolve(empName);
    }
  });
  return deffered.promise;
};

exports.userByUserId = function(empId){
  logger.trace(CurrentUser.empId + ' requested for User.userByUserId');
  var deffered = q.defer();
  User.findOne({empId: empId}, function(err, user){
    if(err){
      logger.fatal('Error in User.nameByUserId. Error : ' + err);
      deffered.reject(err)
    } 
    else{
      logger.debug('Successfully got User in User.userByUserId');
      deffered.resolve(user);
    }
  });
  return deffered.promise;
};

exports.redgIdByEmpId = function(empId){
  logger.trace(CurrentUser.empId + ' requested for User.redgIdByEmpId');
  var deffered = q.defer();
  User.findOne({ empId: empId }, { _id: 0, redgId: 1 }, function(err, user){
    if(err){
      logger.fatal('Error in User.redgIdByEmpId. Error : ' + err);
      deffered.reject(err)
    } 
    else{
      logger.debug('Successfully got redgId for User in User.redgIdByEmpId');
      deffered.resolve(user.redgId);
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
        "userPhotoUrl" : 1,
        "email" : 1
    }
}*/
exports.getUsers = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.getUsers');
  User.find({empId: {$in: req.body.userIds }}, req.body.fieldsRequired, function(err, users){
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
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for User.me');
  var user_Id = req.user._id;
  User.findOne({
    _id: user_Id
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

function handleError(res, err) {
  return res.send(500, err);
}