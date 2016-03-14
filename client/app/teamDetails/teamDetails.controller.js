'use strict';

angular.module('cbApp')
  .controller('TeamDetailsCtrl', function ($scope, $state, httpRequest, $stateParams) {
    $scope.message = 'Hello';
    
    var getTeamDetails = function(){
    	console.log("Team_id in getTeamDetails : ", $stateParams.teamId);
    	var apis = config.apis.getTeamDetails;
  		$scope.teams = [];
  		httpRequest.get(apis + $stateParams.teamId).
  		then(function(team){
  			if(team.status == 200){
      		$scope.team = team.data;
      		console.log("Team Details in getTeamDetails", $scope.team);
  			}
  			else if(teams.status == 404){
  				alert("It's lonely in here. Please create a team to see it here");
  				$state.go('userHome/home');
  			}
  		});
    }
    
    if($stateParams.team) $scope.team = $stateParams.team;
    else getTeamDetails();

    $scope.getTeamActivities = function(){
      $state.go("activities", {'team': $scope.team});
    };

    $scope.toggleFooter = function(){
        $(".home-page-menu-options").slideToggle(250);
    }
  });