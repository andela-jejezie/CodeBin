angular.module("myapp.controllers")
.controller('Settings',['$rootScope','$scope','$state','Utils', 'Settings', function($rootScope, $scope, $state, Utils, Settings) {

  Utils.toast('Welcome ' + $rootScope.authUser.firstName);
  $scope.expertData = [];
  $rootScope.authUser.expertise = [];

  $scope.testing = function(){
    Settings.expertise(function(details){
      $scope.expertArea = details;
      Utils.toast(details);
    });
  };


  $scope.isChecked = function(id){
      var match = false;
      for(var i=0 ; i < $scope.expertData.length; i++) {
        if($scope.expertData[i] === id){
          match = true;
        }
      }
      return match;
  };
  $scope.sync = function(bool, item){
    if(bool){
      // add item
      $scope.expertData.push(item);
    } else {
      // remove item
      for(var i=0 ; i < $scope.expertData.length; i++) {
        if($scope.expertData[i] === item){
          $scope.expertData.splice(i,1);
        }
      }      
    }
  };

  $scope.update = function(){
    $rootScope.authUser.expertise = $scope.expertData;
    Settings.update($rootScope.authUser,function(err){
      if(err && err.message) {
        Utils.toast(err.message);
      }
      else if(!err) {
        Utils.toast('Successfully updated user settings');
        $state.go('default');
      }
    });
 };

}]);
