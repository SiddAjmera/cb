'use strict';

angular.module('cbApp')
  .controller('PostRidesCtrl', function ($scope) {
    $scope.message = 'Hello';

    $scope.leavingInJSON = ["5 MIN.",
                                "10 MIN.",
                                "15 MIN.",
                                "20 MIN.",
                                "25 MIN.",
                                "30 MIN.",
                                "35 MIN.",
                                "40 MIN.",
                                "45 MIN.",
                                "50 MIN.",
                                "55 MIN.",
                                "60 MIN."
                          	];

    $scope.availableSeatsJSON = ["1",
    						 "2",
    						 "3",
    						 "4",
    						 "5",
    						 "6"
    						];
  });
