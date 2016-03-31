'use strict';

angular.module('cbApp')
  .controller('SuggestionsCtrl', function ($scope, leafletMarkerEvents, $timeout,httpRequest,Auth, $stateParams,createTeamHelper, $state) {
    $scope.team = $stateParams.team;
    $scope.membersEmpIds = [];
     
    Auth.getCurrentUser()
        .then(function(data){
            $scope.currentUser = data;
            $scope.center.lat = $scope.currentUser.homeAddressLocation.location[1];
            $scope.center.lng = $scope.currentUser.homeAddressLocation.location[0];
            getAllSuggestions();
        });

    $scope.defaults = {
        minZoom:10,
        maxZoom:18,
        tap:true,
        tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    }

    $scope.markers= [];
    var getAllSuggestions = function(){
        console.log("The current team Object is : ", $stateParams.team);
        httpRequest.get(config.apis.getAllUsers).
        then(function(res){
            console.log("res",res);
            if(res.status==200){
                $scope.suggestedUsers = res.data;

                angular.forEach($scope.suggestedUsers, function(user, key){
                        var tempObj = {};
                        tempObj.lat = parseFloat(user.homeAddressLocation.location[1]);
                        tempObj.lng = parseFloat(user.homeAddressLocation.location[0]);
                        tempObj.enable=['click','touch'];
                        var markerClass ="";
                        if($scope.currentUser.empId == user.empId)
                            markerClass = "map-user-marker user-own";
                        else
                             markerClass = "map-user-marker";
                        var image = angular.element('<img>',{src:user.userPhotoUrl || "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png" ,'class':markerClass, 'id':user.empId+"_img"});
                        var p = angular.element('<p>',{'class':'map-user-name-sec','html':user.empName});

                        console.log(image.outerHTML )
                        /*tempObj.layer="Options";*/
                        tempObj.icon = {
                                            type: 'div',
                                            iconSize: [25, 60],
                                            popupAnchor: [0, -50],
                                            iconAnchor: [10, 45],
                                            html: image[0].outerHTML + p[0].outerHTML
                                        }
                        tempObj.message='<user-marker contactno="'+user.contactNo+'" empid="'+user.empId+'" action="addAsMember('+user.empId+')"></user-marker>';
                        $scope.markers.push(tempObj);
                });
                console.log($scope.markers)
            }
        });
    }    

    
    $scope.toggleFooter = function(){
        $(".home-page-menu-options").slideToggle(250);
    }
   
    $scope.center = {
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 30
    };

    if(config.cordova){
        var eventNameTouch = 'leafletDirectiveMarker.myMap.touch';
        $scope.$on(eventNameTouch, function(event, args){
            $timeout(function(){
                if(!~(args.model.message).indexOf($scope.currentUser.empId)){
                    var  wrapper = document.getElementById('cn-wrapper');
                    if(wrapper) classie.add(wrapper, 'opened-nav');
                }
            },100)
        });
    }
    else{
        var eventNameClick = 'leafletDirectiveMarker.myMap.click';
        $scope.$on(eventNameClick, function(event, args){
            $timeout(function(){
                if(!~(args.model.message).indexOf($scope.currentUser.empId)){
                    var  wrapper = document.getElementById('cn-wrapper');
                    if(wrapper) classie.add(wrapper, 'opened-nav');
                }
            },100)
        });
    }

    

    /**/

    /*{
        osloMarker: {
            lat: 59.91,
            lng: 10.75,
            message: "I want to travel here!",
            focus: true,
            draggable: false
        }
    }*/

    $scope.addAsMember = function(empId){
        console.log("In Add Member with empId : ", empId);
        console.log("membersEmpIds before push : ", $scope.membersEmpIds);
        $scope.membersEmpIds.push(empId);
        console.log("membersEmpIds after push : ", $scope.membersEmpIds);
    };

    $scope.createTeam = function(){
        console.log("$scope.team from createTeam method in Suggestions : ", $scope.team);
        var teamObject = {};
        teamObject.createdByEmpId = $scope.membersEmpIds;
        
        teamObject.team = $scope.team.team;
        teamObject.team.name = teamObject.team.teamName;
        teamObject.team.rideDetails.home = {};
        teamObject.team.rideDetails.home = teamObject.team.rideDetails.from;
        teamObject.team.rideDetails.office = {};
        teamObject.team.rideDetails.office = teamObject.team.rideDetails.to;
        teamObject.team.rideDetails.preferredTimeHToO = teamObject.team.rideDetails.ridePreferredTimeHToO;
        teamObject.team.rideDetails.preferredTimeOToH = teamObject.team.rideDetails.ridePreferredTimeOToH;

        teamObject.membersEmpIds = createTeamHelper.getTeam();

        delete teamObject.team.teamName;
        delete teamObject.team.rideDetails.from;
        delete teamObject.team.rideDetails.to;
        delete teamObject.team.rideDetails.ridePreferredTimeHToO;
        delete teamObject.team.rideDetails.ridePreferredTimeOToH;
        delete teamObject.team.rideDetails.ridePreferredTime;

        console.log("Final Team Object before TeamCreation : ", teamObject);

        httpRequest.post(config.apis.createTeam, teamObject)
                   .then(function(data){
                        console.log("Team Created Successfully. TEAM: ", data.data);
                        if(config.cordova) cordovaUtil.showToastMessage('A request has been sent for the members to join your team.');
                        else alert('A request has been sent for the members to join your team.');
                        createTeamHelper.clearTeam();
                        $state.go('myteams');
                    }, function(data, status, headers, config){
                        console.log("Error creating a Team");
                    });
    };
    
  });