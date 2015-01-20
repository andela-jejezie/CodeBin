angular.module('myapp.services')
.factory('Settings',['$rootScope','Utils', 'Refs', function($rootScope, Utils, Refs){
    
    return {

    	expertise: function(cb){
    		var details = [];
    		Refs.expertise.on('value', function(snap){
    			_.each(snap.val(), function(data){
    				details.push(data);
    			});
    			cb(details);
    		});

    	},

      update: function(user,cb){
          if($rootScope.authUser.isAdmin || $rootScope.authUser.uid === user.uid)
            Refs.users.child(user.uid).set(user,cb);
          else
              cb({message:'Invalid Authorization'});
      } 
    };
}]);