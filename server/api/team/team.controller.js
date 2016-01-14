'use strict';

var _ = require('lodash');
var Team = require('./team.model');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

// Get list of teams
exports.index = function(req, res) {
	logger.trace(req.user.userId + ' requested for Team.Index');
	Team.find(function (err, teams) {
		if(err) { 
		  logger.fatal('Error in Team.Index. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!teams){
	      logger.error('Error in Team.Index. Error : Not Found');
	      return res.send(404);
	    }
	    logger.debug('Successfully got Teams in Team.Index');
		return res.json(200, teams);
	});
};

// Get a single team
exports.show = function(req, res) {
	logger.trace(req.user.userId + ' requested for Team.show');
	Team.findById(req.params.id, function (err, team) {
		if(err) { 
		  logger.fatal('Error in Team.show. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!team){
	      logger.error('Error in Team.show. Error : Not Found');
	      return res.send(404);
	    }
	    logger.debug('Successfully got Team in Team.show');
		return res.json(team);
	});
};

// Creates a new team in the DB.
exports.create = function(req, res) {
	logger.trace(req.user.userId + ' requested for Team.create');
	Team.create(req.body, function(err, team) {
		if(err) { 
		  logger.fatal('Error in Team.create. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!team){
	      logger.error('Error in Team.create. Error : Not Found');
	      return res.send(404);
	    }
	    logger.debug('Successfully created Team in Team.create');
		return res.json(201, team);
	});
};

// Updates an existing team in the DB.
exports.update = function(req, res) {
	logger.trace(req.user.userId + ' requested for Team.update');
	if(req.body._id) { delete req.body._id; }
	Team.findById(req.params.id, function (err, team) {
		if(err) { 
		  logger.fatal('Error in Team.update. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!team){
	      logger.error('Error in Team.update. Error : Not Found');
	      return res.send(404);
	    }
		var updated = _.merge(team, req.body);
		updated.save(function (err) {
			if (err) { 
				logger.fatal('Error in Team.update. Error : ' + err);
				return handleError(res, err); 
			}
			logger.debug('Successfully updated Team in Team.create');
			return res.json(200, team);
		});
	});
};

// Deletes a team from the DB.
exports.destroy = function(req, res) {
	logger.trace(req.user.userId + ' requested for Team.destroy');
	Team.findById(req.params.id, function (err, team) {
		if(err) { 
		  logger.fatal('Error in Team.destroy. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!team){
	      logger.error('Error in Team.destroy. Error : Not Found');
	      return res.send(404);
	    }
		team.remove(function(err) {
			if(err) { 
				logger.fatal('Error in Team.destroy. Error : ' + err);
				return handleError(res, err); 
			}
			logger.debug('Successfully destroyed Team in Team.create');
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}