(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require("./js/config.js");

window.MyApp = angular.module("MyApp", [
  'myapp.controllers',
  'myapp.services',
  'myapp.directives',
  'ngAnimate',
  'ngMaterial',
  'ui.router'
   ]);

MyApp.run(['$rootScope','Refs','$timeout','Authentication', 'Authorization', '$state', function($rootScope, Refs, $timeout, Authentication, Authorization, $state) {
  // set globals we want available in ng expressions
  $rootScope._ = window._;
  $rootScope.moment = window.moment;
  Refs.root.onAuth(function(authData) {
    if(authData) {
      console.log("auth: user is logged in");
      var user = Authentication.buildUserObjectFromGoogle(authData);
      var userRef = Refs.users.child(user.uid);
      userRef.on('value', function(snap) {
        if(!snap.val()) {
          user.created = Firebase.ServerValue.TIMESTAMP;
          userRef.set(user);
          //analytics.track('Signup');
        }
        else{
          user = snap.val();
        }

        $timeout(function(){
          $rootScope.authUser = user;
          $state.go('user/settings');
        });
      });

      // indicate to the rest of the app that we're logged in
      $rootScope.authUser = user;

      // analytics.identify(user.uid, {
      //   name: user.name,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   email: user.email
      // });
    }
    else {
      // user is logged out
      console.log("auth: user is logged out");
      $rootScope.authUser = null;
    }
  });

}]);

MyApp.config(['$stateProvider', '$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

  $locationProvider.html5Mode(true);
  $stateProvider
    .state('default', {
      url: '/',
      templateUrl: 'views/home.html',
      controller: 'Home',
      data: {
        access: 'public'
      }
    })
    .state('user/settings', {
      url: '/user/settings',
      templateUrl: 'views/settings.html',
      controller: 'Settings',
      data: {
        access: 'private'
      }
    });
}]);

window.escapeEmailAddress = function(email) {
  if (!email) {
    return false;
  }
  // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email;
};

},{"./js/config.js":2}],2:[function(require,module,exports){
angular.module("myapp.controllers", ['firebase','ngCookies']);
angular.module("myapp.directives", ['firebase','ngCookies']);
angular.module("myapp.services", ['firebase','ngCookies']);


require("./directives/header.js");

require("./services/authentication.js");
require("./services/authorization.js");
require("./services/settings.js");
require("./services/home.js");
require("./services/refs.js");
require("./services/utils.js");


require("./controllers/home.js");
require("./controllers/settings.js");





},{"./controllers/home.js":3,"./controllers/settings.js":4,"./directives/header.js":5,"./services/authentication.js":6,"./services/authorization.js":7,"./services/home.js":10,"./services/refs.js":11,"./services/settings.js":12,"./services/utils.js":13}],3:[function(require,module,exports){
angular.module("myapp.controllers")
.controller('Home',['$scope','$mdSidenav','$location','$state',
  function($scope,$mdSidenav,$location,$state){


}]);
},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
angular.module("myapp.directives")
  .directive('header', function() {
    return {
      restrict: 'E',
      controller: ['$rootScope', '$scope', 'Authentication',
       function($rootScope, $scope, Authentication) {

        $scope.login = function() {
          Authentication.login();
        };

        $scope.logout = function() {
          Authentication.logout();
        };
      }]
    };
  });

},{}],6:[function(require,module,exports){
angular.module('myapp.services')
.factory('Authentication',['$rootScope','$firebase', 'Refs', '$state', function($rootScope, $firebase, Refs, $state){

  return {
    login: function(){
       //analytics.track('Login');
          var options = { remember: true, scope: "email" };
          Refs.root.authWithOAuthPopup("google", function(err, authData) {
            if(err) {
              console.log('error logging in', err);
            } else {
              console.log('login successful');
            }
          }, options);
    },
    logout: function(){
      Refs.root.unauth();
      $rootScope.authUser = null;
      $state.go('default');
    },
    buildUserObjectFromGoogle: function(authData) {
      return {
        uid: authData.uid,
        name: authData.google.displayName,
        email: authData.google.email,
        accessToken: authData.google.accessToken,
        firstName: authData.google.cachedUserProfile.given_name,
        lastName: authData.google.cachedUserProfile.family_name,
        picture: authData.google.cachedUserProfile.picture
      };
    }
  };
}]);
},{}],7:[function(require,module,exports){
angular.module('myapp.services')
.factory('Authorization',['$rootScope','Utils','$state', function($rootScope, Utils, $state){

    $rootScope.$on('$stateChangeStart',function(event,toState, toParams, fromState){
      var requiresAuth = /^user\//.test(toState.name);
      //console.log(fromState,':',toState);
      if(requiresAuth && !$rootScope.authUser){
        Utils.toast('You need to be logged in');
        $state.go('default');
        event.preventDefault();
      }
    });

    return {

    };
  }
]);
},{}],8:[function(require,module,exports){
module.exports = function(rootRef, $rootScope, $firebase){
  return {
    create:function(stuff){
      rootRef.child('stuff').push(stuff);
    },
    read: function()
    {
      return $firebase(rootRef.child('stuff')).$asArray(); 
    }
  }
};
},{}],9:[function(require,module,exports){
var firebaseRef  = require('../../../../firebase-ref');
module.exports = function($cookies){
  var cookieRootRef = $cookies && $cookies.rootRef?$cookies.rootRef:null;
  var rootRef = new Firebase(cookieRootRef || firebaseRef.dev);
  return {
    root: rootRef,
    users: rootRef.child('users'),
    expertise: rootRef.child('expertise')
  };
};
},{"../../../../firebase-ref":14}],10:[function(require,module,exports){
angular.module("myapp.services")
.factory('Home',['Refs','$rootScope','$firebase',function(Refs, $rootScope,$firebase) {
	return require('./exports/home')(Refs.root, $rootScope, $firebase);
}]);

},{"./exports/home":8}],11:[function(require,module,exports){
angular.module("myapp.services")
.factory('Refs',['$cookies',function($cookies){
  return require('./exports/refs')($cookies);
}]);

},{"./exports/refs":9}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
angular.module('myapp.services')
.factory('Utils',['$rootScope', '$mdToast', function($rootScope, $mdToast) {

  return {
    toast: function(text, hideDelay, position) {
      text = text || 'Toast Text Goes Here';
      hideDelay = hideDelay || 1000;
      position = position || 'bottom left';

      return $mdToast.show({
        template: '<md-toast>'+text+'</md-toast>',
        hideDelay: hideDelay,
        position: position
      });
    }
  };

}]);
},{}],14:[function(require,module,exports){
module.exports = {
  dev: 'https://codebin.firebaseio.com/',
  prod: 'https://codebin.firebaseio.com/'
};

//specify the firebase urls for each environment
},{}]},{},[1]);
