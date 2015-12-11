'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationSchema = new Schema({
  userId: Number,
  locations: [{
  	deviceUUID: String,
  	latitude: Number,
  	longitude: Number,
  	timestamp: String
  }]
});

module.exports = mongoose.model('Location', LocationSchema);