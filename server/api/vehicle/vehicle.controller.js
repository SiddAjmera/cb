'use strict';

var _ = require('lodash');
var Vehicle = require('./vehicle.model');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

// Get list of vehicles
exports.index = function(req, res) {
  logger.trace(req.user.userId + ' requested for Vehicle.Index');
  Vehicle.find(function (err, vehicles) {
    if(err) { 
      logger.fatal('Error in Vehicle.Index. Error : ' + err);
      return handleError(res, err); 
    }
    if(!vehicles){
        logger.error('Error in Vehicle.Index. Error : Not Found');
        return res.send(404);
    }
    logger.debug('Successfully got Vehicles in Vehicle.Index');
    return res.json(200, vehicles);
  });
};

// Get a single vehicle
exports.show = function(req, res) {
  logger.trace(req.user.userId + ' requested for Vehicle.show');
  Vehicle.findById(req.params.id, function (err, vehicle) {
    if(err) { 
      logger.fatal('Error in Vehicle.show. Error : ' + err);
      return handleError(res, err); 
    }
    if(!vehicle){
        logger.error('Error in Vehicle.show. Error : Not Found');
        return res.send(404);
    }
    logger.debug('Successfully got Vehicle in Vehicle.show');
    return res.json(vehicle);
  });
};

// Creates a new vehicle in the DB.
exports.create = function(req, res) {
  logger.trace(req.user.userId + ' requested for Vehicle.create');
  Vehicle.create(req.body, function(err, vehicle) {
    if(err) { 
      logger.fatal('Error in Vehicle.create. Error : ' + err);
      return handleError(res, err); 
    }
    logger.debug('Successfully created Vehicle in Vehicle.show');
    return res.json(201, vehicle);
  });
};

// Gets Vehicle Objects by UserId
exports.getVehiclesByUserId = function(req, res){
  logger.trace(req.user.userId + ' requested for Vehicle.getVehiclesByUserId');
  Vehicle.find().where("ownerUserId", req.body.ownerUserId)
             .exec(function(err, vehicles) {
    if(err) { 
      logger.fatal('Error in Vehicle.getVehiclesByUserId. Error : ' + err);
      return handleError(res, err); 
    }
    if(!vehicles){
        logger.error('Error in Vehicle.getVehiclesByUserId. Error : Not Found');
        return res.send(404);
    }
    logger.debug('Successfully got Vehicles in Vehicle.getVehiclesByUserId');
    return res.json(200, vehicles);
  });
}

exports.getVehicleByVehicleId = function(req, res){
  logger.trace(req.user.userId + ' requested for Vehicle.getVehicleByVehicleId');
  Vehicle.find().where("vehicleLicenseNumber", req.body.vehicleLicenseNumber)
             .exec(function(err, vehicle) {
    if(err) { 
      logger.fatal('Error in Vehicle.getVehicleByVehicleId. Error : ' + err);
      return handleError(res, err); 
    }
    if(!vehicle){
        logger.error('Error in Vehicle.getVehicleByVehicleId. Error : Not Found');
        return res.send(404);
    }
    logger.debug('Successfully got Vehicle in Vehicle.getVehicleByVehicleId');
    return res.json(200, vehicle);
  });
}

// Updates an existing vehicle in the DB.
exports.update = function(req, res) {
  logger.trace(req.user.userId + ' requested for Vehicle.update');
  if(req.body._id) { delete req.body._id; }
  Vehicle.findById(req.params.id, function (err, vehicle) {
    if(err) { 
      logger.fatal('Error in Vehicle.update. Error : ' + err);
      return handleError(res, err); 
    }
    if(!vehicle){
        logger.error('Error in Vehicle.update. Error : Not Found');
        return res.send(404);
    }
    var updated = _.merge(vehicle, req.body);
    updated.save(function (err) {
      if (err) { 
        logger.fatal('Error in Vehicle.update. Error : ' + err);
        return handleError(res, err); 
      }
      logger.debug('Successfully updated Vehicle in Vehicle.update');
      return res.json(200, vehicle);
    });
  });
};

// Deletes a vehicle from the DB.
exports.destroy = function(req, res) {
  logger.trace(req.user.userId + ' requested for Vehicle.destroy');
  Vehicle.findById(req.params.id, function (err, vehicle) {
    if(err) { 
      logger.fatal('Error in Vehicle.destroy. Error : ' + err);
      return handleError(res, err); 
    }
    if(!vehicle){
        logger.error('Error in Vehicle.destroy. Error : Not Found');
        return res.send(404);
    }
    vehicle.remove(function(err) {
      if(err) { 
        logger.fatal('Error in Vehicle.destroy. Error : ' + err);
        return handleError(res, err); 
      }
      logger.debug('Successfully destroyed Vehicle in Vehicle.destroy');
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}