'use strict';

angular.module('cbApp')
  .service('createTeamHelper', function () {
  	var team=[];
  	return{
  		addToTeam:function(user){
  			team.push(user);
  		},
  		getTeam:function(){
  			return team;
  		},
  		clearTeam:function(){
  			team=[];
  		}
  	}
  });