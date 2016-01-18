'use strict';

var _ = require('lodash');
var Location = require('./location.model');
var Drive = require('../drive/drive.controller');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

var events = require('events');
var EventEmitter= new events.EventEmitter();
EventEmitter.on("locationsSaved",function(obj){
  logger.trace('locationsSaved Event emitted for user : ' + CurrentUser.userId);
  Drive.processData({calledfromSync:true,userId:obj.userId,driveId:obj.driveId});
})
// Get list of locations
exports.index = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.Index');
  Location.find(function (err, locations) {
    if(err) {
      logger.fatal('Error in Location.Index. Error : ' + err);
      return handleError(res, err);
    }
    if(!locations){
      logger.error('Error in Location.Index. Error : Not Found');
      return res.send(404);
    }
    logger.debug('Successfully got Locations in Location.Index');
    return res.json(200, locations);
  });
};

// Get a single location
exports.show = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.show');
  Location.findById(req.params.id, function (err, location) {
    if(err) {
      logger.fatal('Error in Location.show. Error : ' + err);
      return handleError(res, err);
    }
    if(!location) {
      logger.error('Error in Location.show. Error : Not Found');
      return res.send(404);
    }
    logger.debug('Successfully got Location in Location.show');
    return res.json(location);
  });
};

// Creates a new location in the DB.
exports.create = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.create');
  var trackedLocations=req.body.trackedLocations
  var almostFinished=req.body.almostFinished

  Location.create(trackedLocations, function(err, location) {
  	if(err) {
      logger.fatal('Error in Location.create. Error : ' + err);
      return handleError(res, err);
    }
    if(!location) {
      logger.error('Error in Location.create. Error : Not Found');
      return res.send(404);
    }
    if(almostFinished){
      logger.debug('Successfully emitted locationsSaved Event in Location.create');
      EventEmitter.emit("locationsSaved",{userId:trackedLocations[0].userId,driveId:trackedLocations[0].driveId});
    }
    return res.json(201, location);
  });
};

// Create or Update a Location Object
exports.createOrUpdateLocation = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.createOrUpdateLocation');
  Location.findOne( { userId: req.body.userId }, function(err, location) {
    if(err){
      logger.fatal('Error in Location.createOrUpdateLocation. Error : ' + err);
      return handleError(res, err);
    }
    if(!location) {
      logger.error('Error in Location.createOrUpdateLocation. Error : Not Found');
      return res.send(404);
    }
    else{
        if(!location) {
            location = new Location();
            location.userId = req.body.userId;
            //location.locations = req.body.locations;
            location.locations.push(req.body.locations);
        }
        location.locations.push(req.body.locations);
        location.save(function(err) {
          if(err){
            logger.fatal('Error in Location.createOrUpdateLocation. Error : ' + err);
            return handleError(res, err);
          }
          else {
              console.log("Location Updated Successfully");
          }
        });
    }
  });
};

// Filters location data based on certain criteria
/* Here the req.body should be like
{
    userId: '962060',
    uuid: ''
}
*/
exports.filterLocation = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.filterLocation');
  Location.find(req.body)
          .sort({'timestamp': 'asc'})
          .exec(function(err, locations){
    if(err) {
      logger.fatal('Error in Location.filterLocation. Error : ' + err);
      return handleError(res, err);
    }
    if(!locations) {
      logger.error('Error in Location.filterLocation. Error : Not Found');
      return res.send(404);
    }
    logger.debug('Successfully got filtered Locations in Location.filterLocation');
    return res.json(200, locations);
  });
};

exports.driveIdsByUser = function(req, res){
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.driveIdsByUser');
  Location.aggregate(
    [
        { $match : { userId : Number(req.body.userId) } },
        { $group : { _id: "$driveId", total: { $sum: 1 } } },
        { $sort  : { driveId : -1 } },
        { $limit : Number(req.body.limit) }
    ],
    function(err,locations) {
       if(err) {
          logger.fatal('Error in Location.driveIdsByUser. Error : ' + err);
          return handleError(res, err);
       }
       if(!locations) {
          logger.error('Error in Location.driveIdsByUser. Error : Not Found');
          return res.send(404);
       }
       var driveIds = [];
       for(var i=0; i < locations.length; i++){
          driveIds.push(locations[i]._id);
       }
       logger.debug('Successfully got driveIds By User in Location.driveIdsByUser');
       return res.json(200, driveIds);
    });
};

// Updates an existing location in the DB.
exports.update = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.update');
  if(req.body._id) { delete req.body._id; }
  Location.findById(req.params.id, function (err, location) {
    if (err) {
      logger.fatal('Error in Location.update. Error : ' + err);
      return handleError(res, err);
    }
    if(!location) {
      logger.error('Error in Location.update. Error : Not Found');
      return res.send(404);
    }
    var updated = _.merge(location, req.body);
    updated.save(function (err) {
      if (err) {
        logger.fatal('Error in Location.update.updated.save Error : ' + err);
        return handleError(res, err);
      }
      logger.debug('Successfully updated location in Location.update');
      return res.json(200, location);
    });
  });
};

// Deletes a location from the DB.
exports.destroy = function(req, res) {
  CurrentUser = req.user;
  logger.trace(req.user.userId + ' requested for Location.destroy');
  Location.findById(req.params.id, function (err, location) {
    if(err) {
      logger.fatal('Error in Location.destroy. Error : ' + err);
      return handleError(res, err);
    }
    if(!location) {
      logger.error('Error in Location.destroy. Error : Not Found');
      return res.send(404);
    }
    location.remove(function(err) {
      if(err) { 
        logger.fatal('Error in Location.destroy Error : ' + err);
        return handleError(res, err);
      }
      logger.debug('Successfully destroyed location in Location.destroy');
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}