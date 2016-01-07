'use strict';

var _ = require('lodash');
var Drive = require('./drive.model');
var Location = require('../location/location.model');
var Turf = require('../../utils/turfOperations');
var moment = require('moment');
var GeoJSON = require('../../utils/geoJSONify');
var MajorPoints = require('../../utils/majorPoints');

// Get list of drives
exports.index = function(req, res) {
  Drive.find(function (err, drives) {
    if(err) { return handleError(res, err); }
    return res.json(200, drives);
  });
};

// Get a single drive
exports.show = function(req, res) {
  Drive.findById(req.params.id, function (err, drive) {
    if(err) { return handleError(res, err); }
    if(!drive) { return res.send(404); }
    return res.json(drive);
  });
};

// Creates a new drive in the DB.
exports.create = function(req, res) {
  Drive.create(req.body, function(err, drive) {
    if(err) { return handleError(res, err); }
    return res.json(201, drive);
  }); 
};

exports.filterDrive = function(req, res){
  Drive.find(req.body).exec(function(err, drives){
    if(err) { return handleError(res, err); }
    return res.json(200, drives);
  });
};

// Updates an existing drive in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Drive.findById(req.params.id, function (err, drive) {
    if (err) { return handleError(err); }
    if(!drive) { return res.send(404); }
    var updated = _.merge(drive, req.body);
    updated.save(function (err) {
      if (err) { return handleError(err); }
      return res.json(200, drive);
    });
  });
};

// Deletes a drive from the DB.
exports.destroy = function(req, res) {
  Drive.findById(req.params.id, function (err, drive) {
    if(err) { return handleError(res, err); }
    if(!drive) { return res.send(404); }
    drive.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Calculate the stats related to the Location Data provided
exports.processData = function(req, res){
 var userId=""
 var driveId=""
  if(req.calledfromSync){
     userId=req.userId
     driveId=req.driveId
  }
   
 else{
 userId=req.body.userId;
 driveId=req.body.driveId;
 }
 

    Location.find({userId:userId,driveId:driveId})
     .sort({'timestamp': 'desc'})
     .exec(function(err, locations) {
         if(err) console.log('Error fetching locations for processing. Error : ' + err);
         else{
            var drive = new Drive();
            drive.driveId = locations[0].driveId;
            drive.userId = locations[0].userId;
            drive.majorPoints = [];
       //     drive.majorPoints = MajorPoints.getMajorWayPoints(locations[0].location, locations[locations.length - 1].location);
            console.log('locations : ' +  drive.driveId);
            drive.totalDistance = Turf.calculateTotalDistance( GeoJSON.geoJSONify(locations));
            drive.distanceUnit = 'm';
            var then = new Date((locations[locations.length - 1].timestamp) *1);
            var now = new Date((locations[0].timestamp) *1);
            drive.totalTime = moment(now).diff(moment(then), 'minute');
            drive.timeUnit = 'min';
            drive.averageSpeed = (drive.totalDistance / drive.totalTime);
            drive.speedUnit = 'm/min';
            console.log('Drive Object : ' + JSON.stringify(drive));
            drive.save(function(err) {
              if (err) { return handleError(err); }
              if(res)
              return res.json(200, drive);
            });
         }
     });
};

// Give this req body as { "userId": "111111" }
exports.latestDriveId = function(req, res){
  console.log('Req.body : ' + JSON.stringify(req.body));
  Drive.find({userId: req.body.userId})
     .sort({'driveId': 'desc'})
     .limit(req.body.limit)
     .exec(function(err, drives) {
         if (err) { return handleError(err); }
         else{
          var obj = [];
          for(var i=0; i<drives.length; i++){
            obj.push(drives[i].driveId);
          }
          return res.json(200, obj);
         }
     });
};

function handleError(res, err) {
  return res.send(500, err);
}