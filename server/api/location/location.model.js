'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationSchema = new Schema({
  /*userId: Number,
  locations: [{
  	deviceUUID: String,
  	latitude: Number,
  	longitude: Number,
  	timestamp: String
  }]*/

  userId: { type: Number, index: true },
  timestamp: { type: String, index: true },
  uuid: { type: String, index: true },
  location: {
  	latitude: Number,
  	longitude: Number
  }
});

module.exports = mongoose.model('Location', LocationSchema);