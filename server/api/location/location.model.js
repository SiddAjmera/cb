'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationSchema = new Schema({
  userId: { type: Number, index: true },
  driveId: { type: Number, index: true },
  timestamp:  String,
  uuid: { type: String, index: true },
  location: {
  	latitude: Number,
  	longitude: Number
  }
});

module.exports = mongoose.model('Location', LocationSchema);