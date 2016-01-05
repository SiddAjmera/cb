'use strict';

var _ = require('lodash');
var Location = require('./location.model');

// Get list of locations
exports.index = function(req, res) {
  Location.find(function (err, locations) {
    if(err) { return handleError(res, err); }
    return res.json(200, locations);
  });
};

// Get a single location
exports.show = function(req, res) {
  Location.findById(req.params.id, function (err, location) {
    if(err) { return handleError(res, err); }
    if(!location) { return res.send(404); }
    return res.json(location);
  });
};

// Creates a new location in the DB.
exports.create = function(req, res) {
  console.log('Request.body : ' + JSON.stringify(req.body) );
  Location.create(req.body, function(err, location) {
  	console.log('Got into Location.create. Here is the error : ' + err + ' and the location : ' + location);
    if(err) { return handleError(res, err); }
    return res.json(201, location);
  });
};

// Create or Update a Location Object
exports.createOrUpdateLocation = function(req, res){
  Location.findOne( { userId: req.body.userId }, function(err, location) {
    if(!err) {
        if(!location) {
            location = new Location();
            location.userId = req.body.userId;
            //location.locations = req.body.locations;
            location.locations.push(req.body.locations);
        }
        location.locations.push(req.body.locations);
        location.save(function(err) {
            if(!err) {
                console.log("Location Updated Successfully");
            }
            else {
                console.log("Error: could not save/update location. Here is the Error : " + JSON.stringify(err));
            }
        });
    }
  });

  /*console.log('Request Object Body : ' + JSON.stringify(req.body));
  Location.update({ userId: req.body.userId },
    { $set:
      {
        locations: req.body.locations
      }
    });*/
};

// Filters location data based on certain criteria
/* Here the req.body should be like
{
    userId: '962060',
    uuid: ''
}
*/
exports.filterLocation = function(req, res){
  Location.find(req.body).exec(function(err, locations){
    if(err) { return handleError(res, err); }
    return res.json(200, locations);
  });
};

// Updates an existing location in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Location.findById(req.params.id, function (err, location) {
    if (err) { return handleError(res, err); }
    if(!location) { return res.send(404); }
    var updated = _.merge(location, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, location);
    });
  });
};

// Deletes a location from the DB.
exports.destroy = function(req, res) {
  Location.findById(req.params.id, function (err, location) {
    if(err) { return handleError(res, err); }
    if(!location) { return res.send(404); }
    location.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}