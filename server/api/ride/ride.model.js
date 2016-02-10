'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var User = require('../user/user.model');

var RideSchema = new Schema({
  startLocation: {
    formatted_address: String,
    display_address: String,
    icon: String,
    location: { type: [Number], index: '2d' },
    placeId: String
  },  // Filled by Start Location in Post Ride
  endLocation: {
    formatted_address: String,
    display_address: String,
    icon: String,
    location: { type: [Number], index: '2d' },
    placeId: String
  },  // Filled by End Location in Post Ride
  rideScheduledTime: { type: Date, default: Date.now },  // Filled by Leaving In field in Post Ride
  routeSummary: String,  // This will show which route has been selected by the User. Will as a " VIA "
  offeredBy: {
    empId: String,
    empName: String,
    gender: String,
    contactNo: String,
    userPhotoUrl: String,
    vehicleLicenseNumber: String,
    rating: Number,
    redgId: String
  }, // Filled by the Details of the User who Posts the Ride
  riders: [{
    empId: String,
    empName: String,
    gender: String,
    contactNo: String,
    userPhotoUrl: String,
    riderStatus: { type: String, enum: ["PENDING", "CONFIRMED"], default: "PENDING" },
    redgId: String
  }], // Filled by the Details of the User who accepts the Ride
  initiallyAvailableSeats: Number,  // Filled by Seats Available
  currentlyAvailableSeats: Number,  // Updated by Entry as a Rider
  rideStatistics: {
    rideStartTime: { type: Date, default: Date.now },
    rideEndTime: { type: Date, default: Date.now },
    totalDistance: Number,
    totalTime: Number,
    stagnantTime: Number,
    averageSpeed: Number
    // Some other Stats required as well
  }, // Updated after the ride is started and completed
  rideStatus: { type: String, enum: [ 'ACTIVE', 'STARTED', 'COMPLETED', 'CANCELLED' ], default: "ACTIVE" }, // Updated when a ride is edited
  createdDate: { type: Date, default: Date.now }, // Time when a ride is created
  modifiedDate: { type: Date, default: Date.now }, // Updated when a ride is modified
  comments: String  // Comments field in the Post Ride section
});

RideSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ride', RideSchema);