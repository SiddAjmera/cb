'use strict';

angular.module('cbApp')
  .controller('MyteamsCtrl', function ($scope, $location, $state, Auth, httpRequest) {
    $scope.message = 'Hello';
    var currentUser;
    Auth.getCurrentUser().then(function(user){
    	currentUser = user;
    	getUserTeams();
    });

    $scope.toggleFooter = function(){
        $(".home-page-menu-options").slideToggle(250);
    }

    $scope.openteamDetails = function(_id){
    	//console.log("_id : ", _id);
    	//$state.go('teamDetails');

    	$location.path('/teamDetails/' + _id);
    }

    var getUserTeams = function(){
    	var apis = config.apis.getUserTeams;
  		$scope.teams = [];
  		httpRequest.get(apis).
  		then(function(teams){
  			if(teams.status == 200){
          		teams = teams.data;
  				$scope.teams = teams;
  				console.log($scope.teams);
  			}
  			else if(teams.status == 404){
  				alert("It's lonely in here. Please create a team to see it here");
  			}
  		});
    }

});
