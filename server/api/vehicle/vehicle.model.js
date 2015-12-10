'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VehicleSchema = new Schema({
  vehicleLicenseNumber: String,
  capacity: Number,
  make: String,
  model: String,
  rfid: String,
  vehiclePhotoUrl: String,
  ownerUserId: Number
});

module.exports = mongoose.model('Vehicle', VehicleSchema);