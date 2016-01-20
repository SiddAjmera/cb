'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');


var User = require('../user/user.model');

var RideSchema = new Schema({
  rideId: { type: Number, index: true },
  availableSeats: Number,
  startLocation: {
    formatted_address: String,
    icon: String,
    location: [Number],
    placeId: String
  },
  endLocation: {
    formatted_address: String,
    icon: String,
    location: [Number],
    placeId: String
  },
  offeredByUserId: String,
  rideStartTime: String,
  vehicleLicenseNumber: String,
  // offeredByUserId: { type: Number, index: true },
  offeredByUser: {
    userId: String,
    userName: String,
    userImage: String,
    totalNumberOfSeats: Number
  },
  companions: [ {
    userId: String,
    status: { type: String, enum: ["PENDING", "CONFIRMED"] }
  }],
  rideDate: Date,
  rideStatus: { type: String, enum: [ 'Active', 'Started', 'Completed', 'Cancelled' ] },
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  comments: String
});

RideSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ride', RideSchema);