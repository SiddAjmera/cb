'use strict';

var _ = require('lodash');
var Ride = require('./ride.model');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Push = require('../../utils/pushNotification');

var events = require('events');
var EventEmitter = new events.EventEmitter();
EventEmitter.on("ridePosted", function(ride){
  //console.log('Ride posted. Here is the Ride Object : ' + JSON.stringify(ride));
  Push.newRideNotification(ride);
});

// Get list of rides
exports.index = function(req, res) {
  Ride.find(function (err, rides) {
    if(err) { return handleError(res, err); }
    return res.json(200, rides);
  });
};

// Get a single ride
exports.show = function(req, res) {
  Ride.findById(req.params.id, function (err, ride) {
    if(err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    return res.json(ride);
  });
};

// Creates a new ride in the DB.
exports.create = function(req, res) {
  Ride.create(req.body, function(err, ride) {
    if(err) { return handleError(res, err); }
    if(ride){
      EventEmitter.emit("ridePosted", ride);
      return res.json(201, ride);
    }
  });
};

// Gets a ride based on any Ride Attribute
exports.getRideByRideAttribute = function(req, res){
  console.log('Got to getRideByRideAttribute');
  Ride.findOne( req.body, function(err, ride) {
    if(err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    return res.json(ride);
  });
};

// Gets rides based on certain criteria
exports.getAvailableRides = function(req, res){
  console.log('Got to getAvailableRides with request body : ' + JSON.stringify(req.body));
  //var arrayOfAvailableRides = Ride.find( JSON.stringify(req.body) ).toArray();
  Ride.find().where("destination", req.body.destination)
             .where("source", req.body.source)
             .where("active", req.body.active)
             .exec(function(err, rides) {
    if(err) { return handleError(res, err); }
    return res.json(200, rides);
  });
};

// Gets inactive rides for current user
exports.getRideHistoryForCurrentUser = function(req, res){
  Ride.find().where("offeredByUser", Schema.Types.ObjectId(req.body.userObjectId))
            // .where("companions.forEachIndex", req.body.userObjectId)  // Some code required to check for ObjectIds in the nested Child Elements as well.
             .where("active", req.body.active)    // Here req.body.active will be false as we want rides from history and not the ones which are currently active.
             .exec(function(err, rides){
    if(err) { return handleError(res, err); }
    if(rides.length == 0) console.log("Rides object is empty. Here it is : " + rides);
    return res.json(200, rides);
  });
};

// Updates an existing ride in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Ride.findById(req.params.id, function (err, ride) {
    if (err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    var updated = _.merge(ride, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, ride);
    });
  });
};

// Deletes a ride from the DB.
exports.destroy = function(req, res) {
  Ride.findById(req.params.id, function (err, ride) {
    if(err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    ride.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}