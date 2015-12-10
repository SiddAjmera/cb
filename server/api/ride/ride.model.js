'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = require('../user/user.model');

var RideSchema = new Schema({
  rideId: Number,
  startLocation: String,
  endLocation: String,
  vehicleLicenseNumber: String,
  offeredByUserId: Number,
  companions: [ { companionUserId: Number } ],
  rideDate: Date,
  rideStartTime: Date,
  rideStatus: { type: String, $in: [ 'Active', 'Started', 'Completed', 'Cancelled' ] },
  createdDate: Date,
  modifiedDate: Date
});

module.exports = mongoose.model('Ride', RideSchema);