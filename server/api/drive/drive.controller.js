'use strict';

var _ = require('lodash');
var Drive = require('./drive.model');
var Location = require('../location/location.model');
var Turf = require('../../utils/turfOperations');
var moment = require('moment');
var GeoJSON = require('../../utils/geoJSONify');
var MajorPoints = require('../../utils/majorPoints');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

var CurrentUser;

// Get list of drives
exports.index = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.Index');
  Drive.find(function (err, drives) {
    if(err) {
      logger.fatal('Error in Drive.Index. Error : ' + err);
      return handleError(res, err); 
    }
    if(!drives){
      logger.error('Error in Drive.Index. Error : Not found');
      return res.send(404);
    }
    logger.debug('Successfully got Drives in Drive.Index');
    return res.json(200, drives);
  });
};

// Get a single drive
exports.show = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.Show');
  Drive.findById(req.params.id, function (err, drive) {
    if(err) {
      logger.fatal('Error in Drive.Show. Error : ' + err);
      return handleError(res, err);
    }
    if(!drive) {
      logger.error('Error in Drive.Show. Error : Not found');
      return res.send(404);
    }
    logger.debug('Successfully got Drive in Drive.Show');
    return res.json(drive);
  });
};

// Creates a new drive in the DB.
exports.create = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.Create');
  Drive.create(req.body, function(err, drive) {
    if(err) {
      logger.fatal('Error in Drive.Create. Error : ' + err);
      return handleError(res, err);
    }
    if(!drive) {
      logger.error('Error in Drive.Create. Error : Not found');
      return res.send(404);
    }
    logger.debug('Successfully got Drive in Drive.Create');
    return res.json(201, drive);
  }); 
};

exports.filterDrive = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.filterDrive');
  Drive.find(req.body).exec(function(err, drives){
    if(err) {
      logger.fatal('Error in Drive.filterDrive. Error : ' + err);
      return handleError(res, err);
    }
    if(!drives) {
      logger.error('Error in Drive.filterDrive. Error : Not found');
      return res.send(404);
    }
    logger.debug('Successfully got Drives in Drive.filterDrive');
    return res.json(200, drives);
  });
};

// Updates an existing drive in the DB.
exports.update = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.update');
  if(req.body._id) { delete req.body._id; }
  Drive.findById(req.params.id, function (err, drive) {
    if (err) {
      logger.fatal('Error in Drive.update. Error : ' + err);
      return handleError(err);
    }
    if(!drive) {
      logger.error('Error in Drive.update. Error : Not found');
      return res.send(404);
    }
    var updated = _.merge(drive, req.body);
    updated.save(function (err) {
      if (err) {
        logger.fatal('Error in Drive.update.updated.save. Error : ' + err);
        return handleError(err);
      }
      logger.debug('Successfully got updated in Drive.update');
      return res.json(200, drive);
    });
  });
};

// Deletes a drive from the DB.
exports.destroy = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.destroy');
  Drive.findById(req.params.id, function (err, drive) {
    if(err) {
      logger.fatal('Error in Drive.destroy. Error : ' + err);
      return handleError(res, err);
    }
    if(!drive) {
      logger.error('Error in Drive.destroy. Error : Not found');
      return res.send(404);
    }
    drive.remove(function(err) {
      if(err) {
        logger.fatal('Error in Drive.remove. Error : ' + err);
        return handleError(res, err);
      }
      logger.debug('Successfully destroyed Drive in Drive.update');
      return res.send(204);
    });
  });
};

// Calculate the stats related to the Location Data provided
exports.processData = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.processData');
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
         if(err) {
          logger.fatal('Error in Drive.processData. Error : ' + err);
         }
         if(!locations){
          logger.error('Error in Drive.processData. Error : Not found');
          return res.send(404);
         }
         else{
            var drive = new Drive();
            drive.driveId = locations[0].driveId;
            drive.userId = locations[0].userId;
            drive.majorPoints = [];
            //drive.majorPoints = MajorPoints.getMajorWayPoints(locations[0].location, locations[locations.length - 1].location);
            //console.log('locations : ' +  drive.driveId);
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
              if (err) {
                logger.fatal('Error in Drive.processData. Error : ' + err);
                return handleError(err);
              }
              if(res){
                logger.debug('Successfully processed Drive in Drive.processData');
                return res.json(200, drive);
              }
            });
         }
     });
};

// Give this req body as { "userId": "111111",  }
exports.latestDriveId = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Drive.latestDriveId');
  Drive.find({userId: req.body.userId})
     .sort({'driveId': 'desc'})
     .limit(req.body.limit)
     .exec(function(err, drives) {
         if (err) {
          logger.fatal('Error in Drive.latestDriveId. Error : ' + err);
          return handleError(err);
         }
         if(!drives){
          logger.error('Error in Drive.latestDriveId. Error : Not found');
          return res.send(404);
         }
         else{
          var obj = [];
          for(var i=0; i<drives.length; i++){
            obj.push(drives[i].driveId);
          }
          logger.debug('Successfully got driveIds in Drive.latestDriveId');
          return res.json(200, obj);
         }
     });
};

function handleError(res, err) {
  return res.send(500, err);
}