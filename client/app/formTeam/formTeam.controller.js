'use strict';

angular.module('cbApp')
  .controller('FormTeamCtrl', function ($scope, Auth, staticData) {
    $scope.message = 'Hello';

    $scope.officeAddressJSON = staticData.getTCSLocations();
    $scope.timeSlotJSON = [
    							{'start':'8:00 AM','end':'5:00 PM'},
    							{'start':'9:00 AM','end':'6:00 PM'},
    							{'start':'10:00 AM','end':'7:00 PM'},
    							{'start':'11:00 AM','end':'8:00 PM'},
    							{'start':'12:00 AM','end':'9:00 PM'},                                
                          ];

    var currentUser = {};
	Auth.getCurrentUser()
    	.then(function(data){
        	currentUser = data;
        	$scope.userHome = currentUser.homeAddressLocation;
		    $scope.userOffice = currentUser.officeAddressLocation;
    	});

    $scope.teamName = "Morning Commute";
    $scope.ridePreferredTimeHToO = "9 AM";
    $scope.ridePreferredTimeOToH = "6 AM";


    $scope.formTeam = function(){
    	var team = {};
    	team.name = $scope.teamName;
    	team.rideDetails = {};
    	team.rideDetails.home = $scope.userHome;
    	team.rideDetails.office = $scope.userOffice;
    	team.rideDetails.preferredTimeHToO = $scope.ridePreferredTimeHToO;
    	team.rideDetails.preferredTimeOToH = $scope.ridePreferredTimeOToH;
    	team.rideDetails.routeSummary = null;


    };

  });
