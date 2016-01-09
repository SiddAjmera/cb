'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = require('../user/user.model');

var RideSchema = new Schema({
  rideId: { type: Number, index: true },
  availableSeats: Number,
  startLocation: {
    formatted_address: String,
    icon: String,
    location: [Number],
    placeId: String,
  },
  endLocation: {
    formatted_address: String,
    icon: String,
    location: [Number],
    placeId: String,
  },
  offeredByUserId: String,
  rideStartTime: String,
  vehicleLicenseNumber: String,
  companions: [ { companionUserId: Number } ],
  rideDate: Date,
  rideStatus: { type: String, $in: [ 'Active', 'Started', 'Completed', 'Cancelled' ] },
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', RideSchema);