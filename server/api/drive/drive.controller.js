'use strict';

var _ = require('lodash');
var Drive = require('./drive.model');
var Location = require('../location/location.model');
var Turf = require('../../utils/turfOperations');
var GeoJSON = require('../../utils/geoJSONify');

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
    Location.find(req.body).exec(function(err, locations){
    if(err) console.log('Error fetching locations for processing. Error : ' + err);
    else{
      var totalDistance = Turf.calculateTotalDistance( GeoJSON.geoJSONify(locations));
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}