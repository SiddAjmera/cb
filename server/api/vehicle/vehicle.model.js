'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VehicleSchema = new Schema({
  vehicleNo: String,
  capacity: Number,
  make: String,
  model: String,
  rfid: String,
  pictureUrl: String
});

module.exports = mongoose.model('Vehicle', VehicleSchema);