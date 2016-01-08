'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = require('../user/user.model');

var RideSchema = new Schema({
  rideId: { type: Number, index: true },
  startLocation: { type: String },
  endLocation: { type: String },
  vehicleLicenseNumber: String,
  offeredByUserId: { type: Number, index: true },
  companions: [ { companionUserId: Number } ],
  rideDate: Date,
  rideStartTime: Date,
  rideStatus: { type: String, $in: [ 'Active', 'Started', 'Completed', 'Cancelled' ] },
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  availableSeats: Number
});

module.exports = mongoose.model('Ride', RideSchema);