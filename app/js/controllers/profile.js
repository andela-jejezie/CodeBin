angular.module("myapp.controllers")
.controller('Profile',['$rootScope','$scope','$state','Utils', 'Settings', function($rootScope, $scope, $state, Utils, Settings) {

    $scope.testing = function(){
    Settings.expertise(function(details){
      $scope.expertArea = details;
    });
  };

}]);
