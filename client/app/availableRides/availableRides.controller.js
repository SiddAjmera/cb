'use strict';

angular.module('cbApp')
  .controller('AvailableRidesCtrl', ['$scope','socket',function ($scope,socket) {
      $scope.message = 'Hello';
      socket.syncUpdates('thing', []);
    }]);
