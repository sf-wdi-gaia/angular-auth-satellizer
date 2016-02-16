angular
  .module('AuthSampleApp', [
    'ui.router'
    // TODO #2: Add satellizer module
  ])
  .controller('MainController', MainController)
  .controller('HomeController', HomeController)
  .controller('LoginController', LoginController)
  .controller('SignupController', SignupController)
  .controller('LogoutController', LogoutController)
  .controller('ProfileController', ProfileController)
  .service('Account', Account)
  .config(configRoutes)
  ;


////////////
// ROUTES //
////////////

configRoutes.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider"]; // minification protection
function configRoutes($stateProvider, $urlRouterProvider, $locationProvider) {

  //this allows us to use routes without hash params!
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  // for any unmatched URL redirect to /
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      controllerAs: 'home'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupController',
      controllerAs: 'sc',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController',
      controllerAs: 'lc',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('logout', {
      url: '/logout',
      template: null,
      controller: 'LogoutController',
      resolve: {
        loginRequired: loginRequired
      }
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      controller: 'ProfileController',
      controllerAs: 'profile',
      resolve: {
        loginRequired: loginRequired
      }
    })


    function skipIfLoggedIn($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }

}

/////////////////
// CONTROLLERS //
/////////////////

MainController.$inject = ["Account"]; // minification protection
function MainController (Account) {
  var vm = this;

  vm.currentUser = function() {
   return Account.currentUser();
  }

}

HomeController.$inject = ["$http"]; // minification protection
function HomeController ($http) {
  var vm = this;
  vm.posts = [];
  vm.new_post = {}; // form data

  $http.get('/api/posts')
    .then(function (response) {
      vm.posts = response.data;
    });
}

LoginController.$inject = ["Account"]; // minification protection
function LoginController (Account) {
  var vm = this;
  vm.new_user = {}; // form data

  vm.login = function() {
    Account
      .login(vm.new_user)
      .then(function(){
         // TODO #4: clear sign up form
         // TODO #5: redirect to '/profile'
      })
  };
}

SignupController.$inject = []; // minification protection
function SignupController () {
  var vm = this;
  vm.new_user = {}; // form data

  vm.signup = function() {
    Account
      .signup(vm.new_user)
      .then(
        function (response) {
          // TODO #9: clear sign up form
          // TODO #10: redirect to '/profile'
        }
      );
  };
}

LogoutController.$inject = ["Account"]; // minification protection
function LogoutController (Account) {
  Account.logout()
  // TODO #7: when the logout succeeds, redirect to the login page
}


ProfileController.$inject = []; // minification protection
function ProfileController () {
  var vm = this;
  vm.new_profile = {}; // form data

  vm.updateProfile = function() {
    // TODO #14: Submit the form using the relevant `Account` method
    // On success, clear the form
  };
}

//////////////
// Services //
//////////////

Account.$inject = ["$http", "$q", "$auth"]; // minification protection
function Account($http, $q, $auth) {
  var self = this;
  self.user = null;

  self.signup = signup;
  self.login = login;
  self.logout = logout;
  self.currentUser = currentUser;
  self.getProfile = getProfile;
  self.updateProfile = updateProfile;

  function signup(userData) {
    // TODO #8: signup (https://github.com/sahat/satellizer#authsignupuser-options)
    // then, set the token (https://github.com/sahat/satellizer#authsettokentoken)
    // returns a promise
  }

  function login(userData) {
    return (
      $auth
        .satellizerLogin(userData) // login (https://github.com/sahat/satellizer#authloginuser-options)
        .then(
          function onSuccess(response) {
            //TODO #3: set token (https://github.com/sahat/satellizer#authsettokentoken)
          },

          function onError(error) {
            console.error(error);
          }
        )
    );
  }

  function logout() {
    // returns a promise!!!
    // TODO #6: logout the user by removing their jwt token (using satellizer)
    // Make sure to also wipe the user's data from the application:
    // self.user = null;
    // returns a promise!!!
  }

  function currentUser() {
    if ( self.user ) { return self.user; }
    if ( !$auth.isAuthenticated() ) { return null; }

    var deferred = $q.defer();
    getProfile().then(
      function onSuccess(response) {
        self.user = response.data;
        deferred.resolve(self.user);
      },

      function onError() {
        $auth.logout();
        self.user = null;
        deferred.reject();
      }
    )
    self.user = promise = deferred.promise;
    return promise;

  }

  function getProfile() {
    return $http.get('/api/me');
  }

  function updateProfile(profileData) {
    return (
      $http
        .put('/api/me', profileData)
        .then(
          function (response) {
            self.user = response.data;
          }
        )
    );
  }


}
