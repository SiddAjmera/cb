'use strict';

var _ = require('lodash');
var Team = require('./team.model');
var User = require('../user/user.model');

var Push = require('../../utils/pushNotification');
var events = require('events');
var EventEmitter = new events.EventEmitter();

var log4js= require('../../utils/serverLogger');
var logger = log4js.getLogger('server'); 

var CurrentUser;

EventEmitter.on("teamCreated", function(team){
  logger.trace('teamCreated Event emitted for user : ' + CurrentUser.empId);
  Push.teamCreatedNotification(team);
});

EventEmitter.on("teamMembersAdded", function(team, newlyAddedMembersRedgIds){
  logger.trace('teamMembersAdded Event emitted for user : ' + CurrentUser.empId);
  Push.notifyRecentlyAddedTeamMembers(team, newlyAddedMembersRedgIds);
});

EventEmitter.on("teamMemberResponded", function(team, memberName, memberResponse){
  logger.trace('teamMemberResponded Event emitted for user : ' + CurrentUser.empId);
  Push.notifyTeamCreatorAboutMemberResponse(team, memberName, memberResponse);
});

// Get list of teams
exports.index = function(req, res) {
	CurrentUser = req.user;
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
	CurrentUser = req.user;
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
	CurrentUser = req.user;
	logger.trace(req.user.empId + ' requested for Team.create');

	var teamToCreate = req.body.team;

	User.findOne({empId: createdByEmpId}, {empId: 1, empName: 1, contactNo: 1, userPhotoUrl: 1,  redgId: 1}, function(err, user){
		if(err) { 
		  logger.fatal('Error in Team.create.User.findOne Error : ' + err);
		  return handleError(res, err); 
		}
		if(!user){
	      logger.error('Error in Team.create.User.findOne Error : User Not Found');
	      return res.send(404);
	    }

	    teamToCreate.offeredBy = user;

	    User.find( {empId: { $in: req.body.membersEmpIds }}, {empId: 1, empName: 1, contactNo: 1, userPhotoUrl: 1,  redgId: 1}, function(err, users){
	    	if(err) { 
			  logger.fatal('Error in Team.create.User.find Error : ' + err);
			  return handleError(res, err); 
			}
			if(!users){
		      logger.error('Error in Team.create.User.find Error : Users Not Found');
		      return res.send(404);
		    }
		    users.forEach(function(user){
		    	user.membershipStatus = "PENDING";
		    });

		    teamToCreate.members = users;

		    Team.create(teamToCreate, function(err, team) {
				if(err) { 
				  logger.fatal('Error in Team.create. Error : ' + err);
				  return handleError(res, err); 
				}
				if(!team){
			      logger.error('Error in Team.create. Error : Not Found');
			      return res.send(404);
			    }
			    logger.debug('Successfully created Team in Team.create');

			    EventEmitter.emit("teamCreated", team);
		        logger.debug('Successfully created team in Team.create');
				return res.json(201, team);
			});

	    });
	});
};

// Updates an existing team in the DB.
exports.update = function(req, res) {
	CurrentUser = req.user;
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
	CurrentUser = req.user;
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
	CurrentUser = req.user;
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

// To add team member(s) to an existing Team.
// This will not add members to a Newly Formed Team. It will only add members to an existing team.
// Addition of members to a newly formed team will take place in create itself.
// Give it an array of empIds to add. And the Team's _id
exports.addMember = function(req, res){
	CurrentUser = req.user;
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
	    User.find( { empId: { $in: req.body.members } }, { empId: 1, empName: 1, contactNo: 1, userPhotoUrl: 1, redgId: 1 }, function(err, users){
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

		    var newlyAddedMembersRedgIds = users.map(function(user){ return user.redgId; });

		    team.members = team.members.concat(users);
		    team.save(function(err){
		    	if(err) { 
				  logger.fatal('Error in Team.addMember. Error : ' + err);
				  return handleError(res, err); 
				}
				logger.debug('Successfully updated Team in Team.addMember');

				EventEmitter.emit("teamMembersAdded", team, newlyAddedMembersRedgIds);
		        logger.debug('Successfully added team member(s) in Team.addMember');
				return res.json(201, team);
		    });
	    });
	});
};

// To update the status of a team member from PENDING to CONFIRMED if User clicks Accept or remove him from Team Members if he clicks Reject
exports.updateMemberStatus = function(req, res){
	CurrentUser = req.user;

	// This will be the EmpId of the User who has ACCEPTED or REJECTED the Membership Offer
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
	    		var respondingEmpName = member.empName;
	    		(membershipStatus == 'ACCEPTED') ? member.membershipStatus = 'CONFIRMED' : members.splice(members.indexOf(member), 1);
	    	}
	    });
	    team.save(function(err){
	    	if(err) { 
			  logger.fatal('Error in Team.updateMemberStatus. Error : ' + err);
			  return handleError(res, err); 
			}
			logger.debug('Successfully updated Team in Team.updateMemberStatus');

			EventEmitter.emit("teamMemberResponded", team, respondingEmpName, membershipStatus);
	        logger.debug('Successfully added team member(s) in Team.addMember');
			return res.json(201, team);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}