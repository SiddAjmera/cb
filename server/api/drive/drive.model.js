'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DriveSchema = new Schema({
  driveId: { type : Number, unique : true, index: true, required : true, dropDups: true },
  userId: { type: Number, index: true },
  totalDistance: Number,
  distanceUnit: String,
  totalTime: Number,
  timeUnit: String,
  stagnantTime: Number,
  averageSpeed: Number,
  speedUnit: String,
  maximumSpeed: Number,
  majorPoints: [
  	{
  		location: {type: [Number], index: '2d'},
  		placeID: String
  	}
  ]
});

module.exports = mongoose.model('Drive', DriveSchema);