'use strict';

var _ = require('lodash');
var Team = require('./team.model');
var User = require('../user/user.model');

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

// Get list of teams
exports.index = function(req, res) {
	logger.trace(req.user.empId + ' requested for Team.Index');
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

// Get a single team by Team's _id
exports.show = function(req, res) {
	logger.trace(req.user.empId + ' requested for Team.show');
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
	logger.trace(req.user.empId + ' requested for Team.create');
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
	logger.trace(req.user.empId + ' requested for Team.update');
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
	logger.trace(req.user.empId + ' requested for Team.destroy');
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

// To get a list of teams of a specific User
exports.teamsOfUser = function(req, res){
	var empId = req.user.empId;
	logger.trace(empId + ' requested for Team.teamsOfUser');

	var query = { 
					$or: [ 
							{ "createdBy.empId": empId },
							{ "members.empId": empId } 
						 ]
				};

	var projection = {
						name: 1,
						"createdBy.empName": 1
					 };

	Team.find(query, projection, function(err, teams){
		if(err) { 
		  logger.fatal('Error in Team.teamsOfUser. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!teams){
	      logger.error('Error in Team.teamsOfUser. Error : Not Found');
	      return res.send(404);
	    }
	    logger.debug('Successfully got Teams in Team.teamsOfUser');
		return res.json(200, teams);
	});
};

// To add team member(s) to an existing Team. Give it an array of empIds to add. And the Team's _id
exports.addMember = function(req, res){
	var empId = req.user.empId;
	logger.trace(empId + ' requested for Team.addMember');

	if(!req.body.members){
		logger.error('Error in Team.addMember. Client did not give array of empIds to add as members');
		return res.json(400, {"Error Message": "Array of Members EmpID is mandatory"});
	}

	Team.findById( req.params.id, function(err, team){
		if(err) { 
		  logger.fatal('Error in Team.addMember. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!teams){
	      logger.error('Error in Team.addMember. Error : Not Found');
	      return res.send(404);
	    }
	    User.find( { empId: { $in: req.body.members } }, { empId: 1, empName: 1, contactNo: 1, userPhotoUrl: 1 }, function(err, users){
	    	if(err) { 
			  logger.fatal('Error in Team.addMember. Error : ' + err);
			  return handleError(res, err); 
			}
			if(!users){
		      logger.error('Error in Team.addMember. Error : Not Found');
		      return res.send(404);
		    }

		    users.forEach(function(user){
                                user.membershipStatus = "PENDING";
                         });

		    team.members = team.members.concat(users);
		    team.save(function(err){
		    	if(err) { 
				  logger.fatal('Error in Team.addMember. Error : ' + err);
				  return handleError(res, err); 
				}
				logger.debug('Successfully updated Team in Team.addMember');
				return res.json(200, team);
		    });
	    });
	});
};

// To update the status of a team member from PENDING to CONFIRMED if User clicks Accept or remove him from Team Members if he clicks Reject
exports.updateMemberStatus = function(req, res){
	var empId = req.user.empId;
	logger.trace(empId + ' requested for Team.updateMemberStatus');
	var membershipStatus = req.body.membershipStatus;
	if(!membershipStatus){
		logger.error('Error in Team.updateMemberStatus. Client did not give membershipStatus: \'ACCEPTED or REJECTED \' ');
		return res.json(400, {"Error Message": " membershipStatus: \'ACCEPTED or REJECTED \' is mandatory "});
	}
	if(membershipStatus != 'ACCEPTED' || membershipStatus != 'REJECTED'){
		logger.error('Error in Team.updateMemberStatus. Client did not give membershipStatus: \'ACCEPTED or REJECTED \' but something else');
		return res.json(400, {"Error Message": " membershipStatus can only be ACCEPTED or REJECTED"});
	}

	Team.findById( req.params.id, function(err, team){
		if(err) { 
		  logger.fatal('Error in Team.updateMemberStatus. Error : ' + err);
		  return handleError(res, err); 
		}
		if(!team){
	      logger.error('Error in Team.updateMemberStatus. Error : Not Found');
	      return res.send(404);
	    }
	    team.members.forEach(function(member){
	    	if(member.empId == empId){
	    		(membershipStatus == 'ACCEPTED') ? member.membershipStatus = 'CONFIRMED' : members.splice(members.indexOf(member), 1);
	    	}
	    });
	    team.save(function(err){
	    	if(err) { 
			  logger.fatal('Error in Team.updateMemberStatus. Error : ' + err);
			  return handleError(res, err); 
			}
			logger.debug('Successfully updated Team in Team.updateMemberStatus');
			return res.json(200, team);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}