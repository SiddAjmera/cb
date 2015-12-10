'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var User = require('../user/user.model');


var TeamSchema = new Schema({
  teamId: Number,
  name: String,
  teamPhotoUrl: String,
  adminUserId: Number,
  members: [
  	{ memberUserId: Number }
  ]
});

module.exports = mongoose.model('Team', TeamSchema);