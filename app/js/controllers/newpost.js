angular.module("myapp.controllers")
.controller('NewPost',['$rootScope','$scope','$state','Utils', 'Settings', function($rootScope, $scope, $state, Utils, Settings) {

  Utils.toast('Dump a Kode hear');

  $scope.inputText = '';
 
  $scope.$watch('inputText', function(current, original) {
      $scope.markdown = current;
  });


}]);
