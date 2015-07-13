// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var pithy = angular.module('starter', ['ionic','firebase']);
var fb = null;

pithy.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    fb = new Firebase("https://pithy-app1.firebaseio.com/");

  });
});


pithy.config(function($stateProvider,$urlRouterProvider){

    $stateProvider
      .state("login",{
          url: "/login",
          templateUrl: "templates/login.html",
          controller: "LoginController"
      })
      .state("quotes",{
          url: "/quotes",
          templateUrl: "templates/quotes.html",
          controller: "QuotesController"
      });
      $urlRouterProvider.otherwise('/login');

});

pithy.controller("LoginController",function($scope,$firebaseAuth,$location){

    $scope.login = function(username,password){
        
        fb.authWithPassword({
          email    : username,
          password : password
        }, function(error, authData) {
          if (error) {
            alert("Login Failed!", error);
          } 
          else {
            //alert("Authenticated successfully with payload:", authData);
              console.log(authData.uid);
              $scope.$apply(function(){
              $location.path('/quotes');
            });
          }
        });
        
    };

    $scope.register = function(username,password){
        
        fb.createUser({
          email    : username,
          password : password
        }, function(error, userData) {
          if (error) {
            console.log("Error creating user:", error);
          } else {
            console.log(userData.uid);
            //alert("Successfully created user account with uid:", userData.uid);
             $scope.$apply(function(){
              $location.path('/quotes');
            });
          }
        });
    };

  });

pithy.controller("QuotesController",function($scope,$firebaseObject,$ionicPopup){

      $scope.list = function(){
          var fbAuth = fb.getAuth();
          if (fbAuth){
              var object = $firebaseObject(fb.child("users/" + fbAuth.uid));
              console.log(object);
              object.$bindTo($scope,"data");
          }

      };

      $scope.create = function(){
        $ionicPopup.prompt({
          title: "Enter a new quote",
          inputType: "text"
        }).then(function(result) {
          if(result !== "") {
            if($scope.data.hasOwnProperty("quotes") !== true) {
              $scope.data.quotes = [];
            }
            $scope.data.quotes.push({title: result});
          } else {
            console.log("Action not completed");
          }
        });
      };


});

