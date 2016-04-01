'use strict';

angular.module('cbApp')
  .service('createTeamHelper', [function () {
  	var team=[];
  	return{
  		addToTeam:function(user){
        for(var i = 0; i < team.length; i++){
            if(team[i] == user) return;
        }
  			team.push(user);
  		},
  		getTeam:function(){
  			return team;
  		},
  		clearTeam:function(){
  			team=[];
  		}
  	}
  }]);