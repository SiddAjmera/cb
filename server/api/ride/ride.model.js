'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = require('../api/user/user.model');

var RideSchema = new Schema({
  rideId: Number,
  offeredByUser : { type: Schema.Types.ObjectId, ref: 'User' },
  companions: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
  source: String,
  destination: String,
  windowForDeparture: Number,
  availableSeats: Number
});

module.exports = mongoose.model('Ride', RideSchema);