// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var pithy = angular.module('pithyApp', ['ionic', 'firebase']);
var fb = null;

pithy.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        fb = new Firebase("https://pithy-app1.firebaseio.com/");

    });
});


pithy.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state("login", {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "LoginController"
        })
        .state("quotes", {
            url: "/quotes",
            templateUrl: "templates/quotes.html",
            controller: "QuotesController"
        });
    $urlRouterProvider.otherwise('/login');

});






pithy.controller("LoginController", function($scope, $firebaseAuth, $location) {

    $scope.$on('$ionicView.beforeEnter', function(viewInfo, state) {
        if (fb.getAuth()) {
            $location.path("/quotes");
        }
    });

    $scope.login = function(username, password) {

        fb.authWithPassword({
            email: username,
            password: password
        }, function(error, authData) {
            if (error) {
                alert(error);
            } else {
                $scope.$apply(function() {
                    $location.path('/quotes');
                });
            }
        });
    };

    $scope.register = function(username, password) {

        fb.createUser({
            email: username,
            password: password
        }, function(error, userData) {
            if (error) {
                alert(error);
            } else {
                $scope.$apply(function() {
                    $location.path('/quotes');
                });
            }
        });
    };

});

pithy.controller("QuotesController", function($scope, $firebaseObject, $ionicPopup, $location, $ionicModal, $ionicListDelegate) {

    //initial refresh
    var initQuotes = function() {
        var fbAuth = fb.getAuth();
        if (fbAuth) {
            console.log("fb auth: ", fbAuth);
            var object = $firebaseObject(fb.child("users/" + fbAuth.uid));
            object.$bindTo($scope, "data");
        }
    };

    //init scope
    var init = function() {
        $scope.tags = [];
        $scope.editedQuote = {
            text: "",
            author: "",
            tags: $scope.tags
        };

    };

    //init private vars
    var currentEditIndex = null;

    //auth check
    $scope.$on('$ionicView.beforeEnter', function(viewInfo, state) {
        initQuotes();
        if (!fb.getAuth()) {
            $location.path("/login");
        }
    });

    $scope.createQuote = function(quote) {
        if (quote && quote.quote != "") {
            if ($scope.data.hasOwnProperty("quotes") !== true) {
                $scope.data.quotes = [];
            }
            $scope.data.quotes.push({
                text: quote.text,
                author: quote.author,
                tags: $scope.tags
            });
            quote.text = "";
            quote.author = "";
            $scope.tags = [];
        } else {
            console.log("action not completed");
        }
        $scope.createModal.hide();

    };

    $scope.prepareForEdit = function(index) {
        currentEditIndex = index;
        console.log($scope.data.quotes[index]);
        $scope.editedQuote.text = $scope.data.quotes[index].text;
        $scope.editedQuote.author = $scope.data.quotes[index].author;
        $scope.tags = $scope.data.quotes[index].tags;
        $scope.editModal.show();
        $ionicListDelegate.closeOptionButtons();

    };

    $scope.editQuote = function(quote) {
        if (currentEditIndex != null) {
            $scope.data.quotes[currentEditIndex].text = quote.text;
            $scope.data.quotes[currentEditIndex].author = quote.author;
            $scope.data.quotes[currentEditIndex].tags = $scope.tags;
            $scope.editModal.hide();
        }
    };

    $scope.editSelected = function(checkboxID, index) {
        $scope.tags.splice(index, 1);
    };

    $scope.addTag = function(input) {
        if (input.length > 0) {
            $scope.tags.push(input)
        }
    };


    $scope.logout = function() {
        fb.unauth();
        $location.path("/login")
    };

    $ionicModal.fromTemplateUrl('templates/create.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.createModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/edit.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.editModal = modal;
    });


    init();

});