'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var User = require('../user/user.model');

// Created according to the "Store What You Query For" Principle. Principle's Name is self explainatory

var TeamSchema = new Schema({
  name: String,
  createdBy: {
  	empId: String,
  	empName: String,
  	contactNo: String,
  	userPhotoUrl: String,
    redgId: String
  },
  members: [{
  	empId: String,
  	empName: String,
  	contactNo: String,
  	userPhotoUrl: String,
  	membershipStatus: { type: String, enum: ["PENDING", "CONFIRMED"], default: "PENDING" },
    redgId: String
  }],
  rideDetails: {
  	home: {
  		formatted_address: String,
	    icon: String,
	    location: {type: [Number], index: '2d'},
	    placeId: String
  	},
  	office: {
  		formatted_address: String,
	    icon: String,
	    location: {type: [Number], index: '2d'},
	    placeId: String
  	},
  	preferredTimeHToO: String,
    preferredTimeOToH: String,
    routeSummary: String
  },
  activities: [{
  	activityTime: { type: Date, default: Date.now },
  	activity: String
  }],
  teamPhotoUrl: String
});

module.exports = mongoose.model('Team', TeamSchema);