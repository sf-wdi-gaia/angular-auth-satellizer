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


config.$inject = ["$routeProvider", "$locationProvider"]) // minification protection
function config($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html',
      controller: 'HomeController'
    })
    .when('/signup', {
      templateUrl: 'templates/signup.html',
      controller: 'AuthController'
    })
    .when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'AuthController'
    })
    .when('/profile', {
      templateUrl: 'templates/profile.html',
      controller: 'ProfileController'
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}

MainController.$inject = ["$scope", "$auth", "$http", "$location"]) // minification protection
function MainController ($scope, $auth, $http, $location) {
  $scope.isAuthenticated = function() {
    // send GET request to '/api/me'
    $http.get('/api/me')
      .then(function (response) {
        // if response.data comes back, set $scope.currentUser = response.data
        if (response.data) {
          $scope.currentUser = response.data;
        } else {
          // otherwise remove token (https://github.com/sahat/satellizer#authremovetoken)
          $auth.removeToken();
        }
      }, function (error) {
        console.error(error);
        $auth.removeToken();
      });
  };

  $scope.isAuthenticated();

  $scope.logout = function() {
    // logout (https://github.com/sahat/satellizer#authlogout)
    $auth.logout()
      .then(function() {
        // set $scope.currentUser = null
        $scope.currentUser = null;
        // redirect to '/login'
        $location.path('/login');
      });
  };
}

HomeController.$inject = ["$scope", "$http"]) // minification protection
function HomeController ($scope, $http) {
  $scope.posts = [];
  $scope.post = {};

  $http.get('/api/posts')
    .then(function (response) {
      $scope.posts = response.data;
    });

  $scope.createPost = function() {
    $http.post('/api/posts', $scope.post)
      .then(function (response) {
        $scope.post = {};
        $scope.posts.push(response.data);
      });
  };
}

AuthController.$inject = ["$scope", "$auth", "$location"]) // minification protection
function AuthController ($scope, $auth, $location) {
  // if $scope.currentUser, redirect to '/profile'
  if ($scope.currentUser) {
    $location.path('/profile');
  }

  // clear sign up / login forms
  $scope.user = {};

  $scope.signup = function() {
    // signup (https://github.com/sahat/satellizer#authsignupuser-options)
    $auth.signup($scope.user)
      .then(function (response) {
        // set token (https://github.com/sahat/satellizer#authsettokentoken)
        $auth.setToken(response.data.token);
        // call $scope.isAuthenticated to set $scope.currentUser
        $scope.isAuthenticated();
        // clear sign up form
        $scope.user = {};
        // redirect to '/profile'
        $location.path('/profile');
      }, function (error) {
        console.error(error);
      });
  };

  $scope.login = function() {
    // login (https://github.com/sahat/satellizer#authloginuser-options)
    $auth.login($scope.user)
      .then(function (response) {
        // set token (https://github.com/sahat/satellizer#authsettokentoken)
        $auth.setToken(response.data.token);
        // call $scope.isAuthenticated to set $scope.currentUser
        $scope.isAuthenticated();
        // clear sign up form
        $scope.user = {};
        // redirect to '/profile'
        $location.path('/profile');
      }, function (error) {
        console.error(error);
      });
  };
}

ProfileController.$inject = ["$scope", "$auth", "$http", "$location"]; // minification protection
function ProfileController ($scope, $auth, $http, $location) {
  // if user is not logged in, redirect to '/login'
  if ($scope.currentUser === undefined) {
    $location.path('/login');
  }

  $scope.editProfile = function() {
    $http.put('/api/me', $scope.currentUser)
      .then(function (response) {
        $scope.showEditForm = false;
      }, function (error) {
        console.error(error);
        $auth.removeToken();
      });
  };
}

function formatDate() {
  return function (date) {
    return date;
  };
}
