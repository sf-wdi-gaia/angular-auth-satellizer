angular
  .module('authSampleApp', [
    'ngRoute',
    'satellizer'
  ])
  .controller('MainController', MainController)
  .controller('HomeController', HomeController)
  .controller('AuthController', AuthController)
  .controller('ProfileController', ProfileController)
  .filter('formatDate', formatDate)
  .config(config)


////////////
// ROUTES //
////////////

config.$inject = ["$routeProvider", "$locationProvider"] // minification protection
function config($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      controllerAs: 'home'
    })
    .when('/signup', {
      templateUrl: 'templates/signup.html',
      controller: 'AuthController',
      controllerAs: 'auth'
    })
    .when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'AuthController',
      controllerAs: 'auth'
    })
    .when('/profile', {
      templateUrl: 'templates/profile.html',
      controller: 'ProfileController',
      controllerAs: 'profile'
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}

/////////////////
// CONTROLLERS //
/////////////////

MainController.$inject = ["$auth", "$http", "$location"] // minification protection
function MainController ($auth, $http, $location) {
  var vm = this;

  vm.isAuthenticated = function() {
    // send GET request to '/api/me'
    $http.get('/api/me')
      .then(function (response) {
        // if response.data comes back, set vm.currentUser = response.data
        if (response.data) {
          vm.currentUser = response.data;
        } else {
          // otherwise remove token (https://github.com/sahat/satellizer#authremovetoken)
          $auth.removeToken();
        }
      }, function (error) {
        console.error(error);
        $auth.removeToken();
      });
  };

  vm.isAuthenticated();

  vm.logout = function() {
    // logout (https://github.com/sahat/satellizer#authlogout)
    $auth.logout()
      .then(function() {
        // set vm.currentUser = null
        vm.currentUser = null;
        // redirect to '/login'
        $location.path('/login');
      });
  };
}

HomeController.$inject = ["$http"] // minification protection
function HomeController ($http) {
  var vm = this;
  vm.posts = [];
  vm.new_post = {};

  $http.get('/api/posts')
    .then(function (response) {
      vm.posts = response.data;
    });

  vm.createPost = function() {
    $http.post('/api/posts', vm.new_post)
      .then(function (response) {
        vm.new_post = {};
        vm.posts.push(response.data);
      });
  };
}

AuthController.$inject = ["$auth", "$location"] // minification protection
function AuthController ($auth, $location) {
  var vm = this;

  // if vm.currentUser, redirect to '/profile'
  if (vm.currentUser) {
    $location.path('/profile');
  }

  // clear sign up / login forms
  vm.new_user = {};

  vm.signup = function() {
    // signup (https://github.com/sahat/satellizer#authsignupuser-options)
    $auth.signup(vm.new_user)
      .then(function (response) {
        // set token (https://github.com/sahat/satellizer#authsettokentoken)
        $auth.setToken(response.data.token);
        // call vm.isAuthenticated to set vm.currentUser
        vm.isAuthenticated();
        // clear sign up form
        vm.new_user = {};
        // redirect to '/profile'
        $location.path('/profile');
      }, function (error) {
        console.error(error);
      });
  };

  vm.login = function() {
    // login (https://github.com/sahat/satellizer#authloginuser-options)
    $auth.login(vm.new_user)
      .then(function (response) {
        // set token (https://github.com/sahat/satellizer#authsettokentoken)
        $auth.setToken(response.data.token);
        // call vm.isAuthenticated to set vm.currentUser
        vm.isAuthenticated();
        // clear sign up form
        vm.new_user = {};
        // redirect to '/profile'
        $location.path('/profile');
      }, function (error) {
        console.error(error);
      });
  };
}

ProfileController.$inject = ["$auth", "$http", "$location"] // minification protection
function ProfileController ($auth, $http, $location) {
  var vm = this;
  // if user is not logged in, redirect to '/login'
  if (vm.currentUser === undefined) {
    $location.path('/login');
  }

  vm.editProfile = function() {
    $http.put('/api/me', vm.currentUser)
      .then(function (response) {
        vm.showEditForm = false;
      }, function (error) {
        console.error(error);
        $auth.removeToken();
      });
  };
}

////////////////////
// Custom Filters //
////////////////////

function formatDate() {
  return function (date) {
    return date;
  };
}
