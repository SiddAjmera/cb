'use strict';

var _ = require('lodash');
var Ride = require('./ride.model');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var User = require('../user/user.model');
var Push = require('../../utils/pushNotification');
var Util = require('../../utils/geoJSONify');
var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server');

var events = require('events');
var EventEmitter = new events.EventEmitter();

var CurrentUser;

EventEmitter.on("ridePosted", function(ride){
  logger.trace('ridePosted Event emitted for user : ' + CurrentUser.empId);
  Push.newRideNotification(ride);
});

EventEmitter.on("userRequestedARide", function(ride){
  logger.trace('userRequestedARide Event emitted for user : ' + CurrentUser.empId);
  Push.notifyHostAboutANewRiderRequest(ride);
});

EventEmitter.on("hostRespondedToRideRequest", function(ride){
  logger.trace('hostRespondedToRideRequest Event emitted for user : ' + CurrentUser.empId);
  Push.notifyRiderAboutHostResponse(ride, riderUserId);
});

// Get list of rides
exports.index = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for Ride.Index');
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
  logger.trace(req.user.empId + ' requested for Ride.show');
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
  var empId = req.user.empId;
  logger.trace(empId + ' requested for Ride.create');

  Ride.findOne({  rideStatus: "ACTIVE",
                  $or:  [ 
                          { "offeredBy.empId": empId },
                          { "riders.empId": empId }
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

    // Since there is no active Ride with the Above User, the user can post a ride
    User.findOne({empId: empId}, function (err, user) {
        if (err) {
          logger.fatal('Error in Ride.create. Error : ' + err);
          return handleError(res, err);
        }
        if (!user)  { 
          logger.error('Error in Ride.create. Error : User Not Found');
          return res.send(404);
        }
        // This means that the user is posting the Ride for the first time.
        // That's why we are receiving the other required details by the User in the req.body.user
        // Details like Car Number, Seats Available, Office Address, Home Address, Shift Time-in & Shift Time-out will be stored here
        if(req.body.user){
          var updated = _.merge(user, req.body.user);
          updated.save(function (err) {
            if (err) { 
              logger.fatal('Error in Ride.create.updated.save. Error : ' + err);
              return handleError(res, err); 
            }
            logger.debug('Successfully updated user details in Ride.create');
          });
        }

        // This means that the user has created ride(s) earlier. So we needn't save User's other details in this one.
        // We will directly store the Ride
        var rideBody = req.body.ride;
        var offeredBy = {};
        offeredBy.empId = user.empId;
        offeredBy.empName = user.empName;
        offeredBy.gender = user.gender;
        offeredBy.contactNo = user.contactNo;
        offeredBy.userPhotoUrl = user.userPhotoUrl;
        offeredBy.rating = user.rating;
        // This might be tricky. Since this is Async, this might get executed even before the User Vehicle Details are saved for the first time.
        if(user.vehicle) offeredBy.vehicleLicenseNumber = user.vehicle.vehicleLicenseNumber;
        rideBody.offeredBy = offeredBy;
        ride.rideStatus = "ACTIVE";

        Ride.create(rideBody, function(err, ride) {
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
            logger.debug('Successfully created ride in Ride.create');
            return res.json(201, ride);
          }
        });
      });
  });
};

// Gets a ride based on any Ride Attribute
exports.getRideByRideAttribute = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for Ride.getRideByRideAttribute');
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
  logger.trace(req.user.empId + ' requested for Ride.filterRide');
  var query = {
    "offeredBy.empId": { $ne: req.user.empId },
    currentlyAvailableSeats: { $ne: 0 }
  };
  //if(req.body.filters) query = req.body.filters;
  var options = {
      sort:   { createdDate: -1 }
  };
  if(req.body.page) options.page = req.body.page;
  else options.page = 0;

  if(req.body.limit) options.limit = req.body.limit;
  else options.limit = 10;

  Ride.paginate(query, options).then(function(rides) {
    logger.debug('Successfully got paginated rides in Ride.filterRide');
    return res.json(200, rides[0]);
  });
};

// Gets rides based on certain criteria.  TODO - Write Logic to get list of available rides
exports.getAvailableRides = function(req, res){
  CurrentUser = req.user;
  var empId = req.user.empId;
  logger.trace(empId + ' requested for Ride.getAvailableRides');

  // Either this
  /*mongoose.connection.db.executeDbCommand({ 
    geoNear : "rides",  // the mongo collection
    near : [4.881213, 52.366455], // the geo point
    spherical : true,  // tell mongo the earth is round, so it calculates based on a spherical location system
    distanceMultiplier: 6371, // tell mongo how many radians go into one kilometer.
    maxDistance : 1/6371, // tell mongo the max distance in radians to filter out
  }, function(err, result) {
    console.log('Result: ' + result)
    console.log(result.documents[0].results);
  });*/

  // Or this
  Ride.geoNear( 
      user.homeAddressLocation.location,  // TODO : To replace this with User's Current Location sent in the req.body
      {
          spherical           : true,            // tell mongo the earth is round, so it calculates based on a spherical location system
          distanceMultiplier  : 6371,            // tell mongo how many radians go into one kilometer.
          maxDistance         : 1/6371,          // tell mongo the max distance in radians to filter out
          "offeredBy.empId"   : { $ne : empId }, // tell mongo to return only rides which haven't been hosted by the User requesting them
          "rideStatus"        : "ACTIVE"         // tell mongo to only return ACTIVE rides
      },
      {
          "offeredBy.empName": 1,
          "offeredBy.gender": 1,
          "offeredBy.rating": 1,
          "offeredBy.userPhotoUrl": 1,
          "startLocation.display_address": 1,
          "endLocation.display_address": 1,
          "routeSummary": 1,
          "rideScheduledTime": 1,
          "initiallyAvailableSeats": 1,
          "currentlyAvailableSeats": 1
      },function(err, results, stats){
          if(err) {
            logger.fatal('Error in Ride.getAvailableRides. Error : ' + err);
            return handleError(res, err);
          }
          if(!results){
            logger.error('Error in Ride.getAvailableRides. Error : Not Found');
            return res.send(404);
          }
          logger.debug('Successfully got rides in Ride.getAvailableRides');
          console.log('Results', results);
          return res.json(200, results);
  });
};

// Gets inactive rides for current user
exports.getRideHistoryForCurrentUser = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for Ride.getRideHistoryForCurrentUser');
  Ride.find({ 
                $or:[ 
                        { "offeredBy.empId": req.user.empId },
                        { "riders.empId": req.user.empId }
                    ],
                rideStatus: 'COMPLETED'
            }, function(err, rides){
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
  logger.trace(req.user.empId + ' requested for Ride.update');
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

// When a person requests a particular ride from the list of available rides page
exports.addCompanionToRide = function(req, res){
  CurrentUser = req.user;
  var empId = req.user.empId;
  logger.trace(empId + ' requested for Ride.addCompanionToRide');
  if(req.body._id) { delete req.body._id; }

  //If the Companion is already a part of an Active/Started Ride, he can't be added as a Companion to other rides
  Ride.findOne( {
                  rideStatus: {$in: ['ACTIVE', 'STARTED']},
                  $or:  [ 
                          { "offeredBy.empId": empId },
                          { "riders.empId": empId }
                        ]
                }, function(err, ride){
                    if (err) { 
                      logger.fatal('Error in Ride.addCompanionToRide. Error : ' + err);
                      return handleError(res, err); 
                    }
                    if(ride) { 
                      logger.error('Error in Ride.addCompanionToRide. Error : User is already a part of an ACTIVE RIDE');
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

                        User.findOne( { empId: empId },
                                      { empId: 1, empName: 1, gender:1, contactNo: 1, userPhotoUrl: 1 },
                                        function(err, user){
                                          if (err) { 
                                            logger.fatal('Error in Ride.addCompanionToRide.User.findOne Error : ' + err);
                                            return handleError(res, err); 
                                          }
                                          if(!user) { 
                                            logger.error('Error in Ride.addCompanionToRide.User.findOne Error : User Not Found');
                                            return res.send(404); 
                                          }
                                          user.riderStatus = "PENDING";
                                          ride.riders.push(user);
                                          ride.save(function(err){
                                              if (err) { 
                                                logger.fatal('Error in Ride.addCompanionToRide. Error : ' + err);
                                                return handleError(res, err); 
                                              }
                                              logger.debug('Successfully added a companion to ride with PENDING STATUS in Ride.getRideHistoryForCurrentUser');

                                              EventEmitter.emit("userRequestedARide", ride);
                                              logger.debug('Successfully requested to ride together in Ride.addCompanionToRide');
                                              return res.json(201, ride);
                                          });
                                    });
                      });
                    }
              });
};

// When the host accepts the Companion's Request to Ride with him.
// Client should give the empId of the person whose request has been responded by the HOST OF THE RIDE
// Client should also give the response - ACCEPTED / REJECTED
exports.updateRiderStatus = function(req, res){
  var empId = req.user.empId;
  logger.trace(empId + ' requested for Ride.updateRiderStatus');
  var riderStatus = req.body.riderStatus;
  var riderEmpId = req.body.riderEmpId;

  if(!riderStatus){
    logger.error('Error in RideTeam.updateRiderStatus. Client did not give riderStatus: \'ACCEPTED or REJECTED \' ');
    return res.json(400, {"Error Message": " riderStatus: \'ACCEPTED or REJECTED \' is mandatory "});
  }
  if(riderStatus != 'ACCEPTED' || riderStatus != 'REJECTED'){
    logger.error('Error in Ride.updateRiderStatus. Client did not give riderStatus: \'ACCEPTED or REJECTED \' but something else');
    return res.json(400, {"Error Message": " riderStatus can only be ACCEPTED or REJECTED"});
  }
  Ride.findById( req.params.id, function(err, ride){
    if(err) { 
      logger.fatal('Error in Ride.updateRiderStatus. Error : ' + err);
      return handleError(res, err); 
    }
    if(!ride){
      logger.error('Error in Ride.updateRiderStatus. Error : Ride Not Found');
      return res.send(404);
    }
    ride.riders.forEach(function(rider){
      if(rider.empId == riderEmpId){
        (riderStatus == 'ACCEPTED') ? rider.riderStatus = 'CONFIRMED' : ride.riders.splice(riders.indexOf(rider), 1);
      }
    });
    ride.save(function(err){
      if(err) { 
        logger.fatal('Error in Ride.updateRiderStatus. Error : ' + err);
        return handleError(res, err); 
      }
      logger.debug('Successfully updated Rider Status in Ride.updateRiderStatus');

      EventEmitter.emit("hostRespondedToRideRequest", ride, riderEmpId);
      logger.debug('Successfully responded to rider who requested to ride together in Ride.updateRiderStatus');
      return res.json(201, ride);
    });
  });
};

// Deletes a ride from the DB.
exports.destroy = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.empId + ' requested for Ride.destroy');
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