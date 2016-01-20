'use strict';

var _ = require('lodash');
var Ride = require('./ride.model');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var User = require('../user/user.model')
var Push = require('../../utils/pushNotification');
var Util = require('../../utils/geoJSONify');
var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server');

var events = require('events');
var EventEmitter = new events.EventEmitter();

var CurrentUser;

EventEmitter.on("ridePosted", function(ride){
  logger.trace('ridePosted Event emitted for user : ' + CurrentUser.userId);
  Push.newRideNotification(ride);
});

// Get list of rides
exports.index = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.Index');
  Ride.find(function (err, rides) {
    if(err) { 
      logger.fatal('Error in Ride.Index. Error : ' + err);
      return handleError(res, err);
    }
    if(!rides){
      logger.error('Error in Ride.Index. Error : Not Found');
      return res.send(404);
    }
    logger.debug('Successfully got rides in Ride.Index');
    return res.json(200, rides);
  });
};

// Get a single ride
exports.show = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.show');
  Ride.findById(req.params.id, function (err, ride) {
    if(err) { 
      logger.fatal('Error in Ride.show. Error : ' + err);
      return handleError(res, err);
    }
    if(!ride) {
      logger.error('Error in Ride.show. Error : Not Found');
      return res.send(404);
    }
    logger.debug('Successfully got ride in Ride.show');
    return res.json(ride);
  });
};

// Creates a new ride in the DB.
exports.create = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.create');
  var userId = parseInt(req.user.userId);

  Ride.findOne({  rideStatus: "Active",
                  $or:  [ 
                          { offeredByUserId: userId },
                          { companions: userId }
                        ]}, function(err, ride){
    if(err){
      logger.fatal('Error in Ride.create. Error : ' + err);
      return handleError(res, err);
    }
    if(ride){
      console.log('An Active Ride Already Exist');
      logger.error('Error in Ride.create. Error : An ACTIVE RIDE already exist');
      // Conflict as an ACTIVE RIDE Object for that particular User already exist
      return res.send(409);
    }




    User.findOne({userId: userId}, function (err, user) {
        if (err) { 
          logger.fatal('Error in Ride.create. Error : ' + err);
          return handleError(res, err);
        }
        if (!user)  { 
          logger.error('Error in Ride.create. Error : Not Found');
          return res.send(404);
        }
        req.body.offeredByUser = {};
        req.body.offeredByUser.userId = user.empId;
        req.body.offeredByUser.userName = user.empName;
        req.body.offeredByUser.userImage = user.userPhotoUrl;
        req.body.offeredByUser.totalNumberOfSeats=user.vehicle.capacity;
        if(user.vehicle){
          /*console.log('\nUser.Vehicle k if me ghusa');
          console.log('\nReq.body.offeredByUser.AvailableSeats : ' + req.body.offeredByUser.availableSeats);
          console.log('\nUser.Vehicle.Capacity : ' + user.vehicle.capacity);*/
        /*  if(parseInt(req.body.availableSeats) > parseInt(user.vehicle.capacity)) {
            console.log('If Available Seats > Vehicle capacity me ghusa');
            return handleError(res, 'Specified Available Seats is more than the capacity of your Vehicle');
          } */
        }
        else{
          return handleError(res, 'You cant post a ride as you dont have a vehicle.');
        }
        Ride.create(req.body, function(err, ride) {
          if(err) {
            logger.fatal('Error in Ride.create. Error : ' + err);
            return handleError(res, err);
          }
          if (!ride)  { 
            logger.error('Error in Ride.create. Error : Not Found');
            return res.send(404);
          }
          if(ride){
            EventEmitter.emit("ridePosted", ride);
            logger.debug('Successfully created ride in Ride.show');
            return res.json(201, ride);
          }
        });
      });




  });
};

// Gets a ride based on any Ride Attribute
exports.getRideByRideAttribute = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.getRideByRideAttribute');
  Ride.findOne( req.body, function(err, ride) {
    if(err) { 
      logger.fatal('Error in Ride.getRideByRideAttribute. Error : ' + err);
      return handleError(res, err); 
    }
    if(!ride) { 
      logger.error('Error in Ride.getRideByRideAttribute. Error : Not Found');
      return res.send(404); 
    }
    logger.debug('Successfully got ride in Ride.getRideByRideAttribute');
    return res.json(ride);
  });
};

// Filter rides by ride attribute(s)
// Post the data to this service like : 
/*{
  "filters" : { 
                  "startLocation": "location1",
                  "endLocation": "location2",
                  "offeredByUserId": { $nin: ['111111'] },
                  "availableSeats": { $nin: ['0']}
              },
  "page" : 1,
  "limit" : 10
}*/

exports.filterRide = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.filterRide');
  var query = {
    offeredByUserId: { $nin: [req.body.userId] },
    availableSeats: { $nin: ['0']}
  };
  //if(req.body.filters) query = req.body.filters;
  var options = {
      sort:   { createdDate: -1 }
  };
  if(req.body.page) options.page = req.body.page;
  else options.page = 0;

  if(req.body.limit) options.limit = req.body.limit;
  else options.limit = 10;

  //console.log('\nQuery : ' + JSON.stringify(query) + '\n Options : ' + JSON.stringify(options));

  Ride.paginate(query, options).then(function(rides) {
    logger.debug('Successfully got paginated rides in Ride.filterRide');
    return res.json(200, rides[0]);
  });
};

// Gets rides based on certain criteria
exports.getAvailableRides = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.getAvailableRides');
  Ride.find().where("destination", req.body.destination)
             .where("source", req.body.source)
             .where("active", req.body.active)
             .exec(function(err, rides) {
    if(err) { 
      logger.fatal('Error in Ride.getAvailableRides. Error : ' + err);
      return handleError(res, err); 
    }
    if(!rides) { 
      logger.error('Error in Ride.getAvailableRides. Error : Not Found');
      return res.send(404); 
    }
    logger.debug('Successfully got rides in Ride.getAvailableRides');
    return res.json(200, rides);
  });
};

// Gets inactive rides for current user
exports.getRideHistoryForCurrentUser = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.getRideHistoryForCurrentUser');
  Ride.find().where("offeredByUser", Schema.Types.ObjectId(req.body.userObjectId))
            // .where("companions.forEachIndex", req.body.userObjectId)  // Some code required to check for ObjectIds in the nested Child Elements as well.
             .where("active", req.body.active)    // Here req.body.active will be false as we want rides from history and not the ones which are currently active.
             .exec(function(err, rides){
    if(err) { 
      logger.fatal('Error in Ride.getRideHistoryForCurrentUser. Error : ' + err);
      return handleError(res, err); 
    }
    if(!rides) { 
      logger.error('Error in Ride.getRideHistoryForCurrentUser. Error : Not Found');
      return res.send(404); 
    }
    logger.debug('Successfully got rides in Ride.getRideHistoryForCurrentUser');
    return res.json(200, rides);
  });
};

// Updates an existing ride in the DB.
exports.update = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.update');
  if(req.body._id) { delete req.body._id; }
  Ride.findById(req.params.id, function (err, ride) {
    if (err) {
     logger.fatal('Error in Ride.update. Error : ' + err);
     return handleError(res, err); 
    }
    if(!ride) { 
      logger.error('Error in Ride.update. Error : Not Found');
      return res.send(404); 
    }
    var updated = _.merge(ride, req.body);
    updated.save(function (err) {
      if (err) { 
        logger.fatal('Error in Ride.update.updated.save. Error : ' + err);
        return handleError(res, err); 
      }
      logger.debug('Successfully updated ride in Ride.update');
      return res.json(200, ride);
    });
  });
};

exports.addCompanionToRide = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.addCompanionToRide');
  if(req.body._id) { delete req.body._id; }

  //If the Companion is already a part of an Active/Started Ride, he can't be added as a Companion to other rides
  Ride.findOne( { rideStatus: {$in: ['Active', 'Started']},
                  $or:  [ 
                          { offeredByUserId: {$in: Util.toArrayOfUserIds(req.body.companions) } },
                          { companions: {$in: Util.toArrayOfUserIds(req.body.companions) } }
                        ]
                }, function(err, ride){
    if (err) { 
      logger.fatal('Error in Ride.addCompanionToRide. Error : ' + err);
      return handleError(res, err); 
    }
    if(ride) { 
      console.log('Error in Ride.addCompanionToRide. Error : User is already a part of an ACTIVE RIDE');
      logger.error('Error in R')
      return res.send(409); 
    }
    else{
      Ride.findById(req.params.id, function (err, ride) {
        if (err) { 
          logger.fatal('Error in Ride.addCompanionToRide. Error : ' + err);
          return handleError(res, err); 
        }
        if(!ride) { 
          logger.error('Error in Ride.addCompanionToRide. Error : Not Found');
          return res.send(404); 
        }
        ride.companions = ride.companions.concat(req.body.companions);
        ride.availableSeats = req.body.availableSeats;
        ride.save(function(err){
          if (err) { 
            logger.fatal('Error in Ride.addCompanionToRide. Error : ' + err);
            return handleError(res, err); 
          }
          logger.debug('Successfully added companions to ride in Ride.getRideHistoryForCurrentUser');
          return res.json(200, ride);
        });
      });
    }
  });
};

// Deletes a ride from the DB.
exports.destroy = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Ride.destroy');
  Ride.findById(req.params.id, function (err, ride) {
    if(err) { 
      logger.fatal('Error in Ride.destroy. Error : ' + err);
      return handleError(res, err); 
    }
    if(!ride) { 
      logger.error('Error in Ride.destroy. Error : Not Found');
      return res.send(404); 
    }
    ride.remove(function(err) {
      if(err) { 
        logger.fatal('Error in Ride.destroy. Error : ' + err);
        return handleError(res, err); 
      }
      logger.debug('Successfully destroyed ride in Ride.destroy');
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}