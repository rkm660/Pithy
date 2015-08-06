// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var pithy = angular.module('pithyApp', ['ionic', 'firebase', 'ngCordova',
    'ionic.service.core',
    'ionic.service.push'
]);
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


pithy.config(function($stateProvider, $urlRouterProvider, $ionicAppProvider) {

    // Identify app
    $ionicAppProvider.identify({
        // The App ID (from apps.ionic.io) for the server
        app_id: 'b323c695',
        // The public API key all services will use for this app
        api_key: '3957c31444fdddad48fc3d73c08b2eeca9dfc81ca62c241a',
        // Set the app to use development pushes
        dev_push: false
    });

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
                    alert("Successfully registered! Please log in.");
                });
            }
        });
    };

});

pithy.controller("QuotesController", function($http,$scope, $firebaseObject, $ionicPopup, $location, $ionicModal, $ionicListDelegate, $state, $rootScope, $ionicUser, $ionicPush) {

    var identifyUser = function() {
        var auth = fb.getAuth();
        var user = $ionicUser.get();
        user.user_id = auth.uid;


        $ionicUser.identify(user).then(function() {
            $scope.identified = true;
            $scope.currentUser = user;
        });
    };


    var pushRegister = function() {
        // Register with the Ionic Push service.  All parameters are optional.
        $ionicPush.register({
            canShowAlert: true, //Can pushes show an alert on your screen?
            canSetBadge: true, //Can pushes update app icon badges?
            canPlaySound: true, //Can notifications play a sound?
            canRunActionsOnWake: true, //Can run actions outside the app,
            onNotification: function(notification) {
                // Handle new push notifications here
                console.log(notification);
                return true;
            }
        });
    };

    // Handles incoming device tokens
    $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        console.log('Ionic Push: Got token ', data.token, data.platform);
        $scope.token = data.token;
        var identifiedUsers = new Firebase("https://pithy-app1.firebaseio.com/identifiedUsers");
        var newUser = identifiedUsers.child($scope.token.toString());
        var fbAuth = fb.getAuth();
        newUser.set({
            userID: fbAuth.uid
        });

    });

    //initial refresh
    var refreshQuotes = function() {
        var fbAuth = fb.getAuth();
        if (fbAuth) {
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
            tags: [],
            num: 0
        };
        identifyUser();
        pushRegister();

    };

    var getTimestamps = function(num){
        var timestamps = [];
        if (num > 0){
            var now = Date.now()
            var dailyMilli = 86400000;
            var tomorrow = now + dailyMilli;
            for (var i = 0; i < num; i++){
                timestamps.push(now + ((    tomorrow - now) / num) * i);
            }
        }
        return timestamps;
        
    }

    //init private vars
    var currentEditIndex = null;

    //auth check
    $scope.$on('$ionicView.beforeEnter', function(viewInfo, state) {
        if (!fb.getAuth()) {
            $location.path("/login");
        }
        refreshQuotes();
        init();

    });

    $scope.createQuote = function(quote) {
        if (quote && quote.text != "") {
            if ($scope.data.hasOwnProperty("quotes") !== true) {
                $scope.data.quotes = [];
            }
            $scope.data.quotes.push({
                text: quote.text,
                author: (!quote.author || quote.author.length == 0) ? "Unknown" : quote.author,
                num: quote.num,
                tags: $scope.tags,
                timestamps: getTimestamps(quote.num)

            });
            quote.text = "";
            quote.author = "";
            quote.num = 0;
            $scope.tags = [];

        } else {
            console.log("action not completed");
        }
        $scope.createModal.hide();

    };

    $scope.showCreateModal = function() {
        $scope.tags = [];
        $scope.createModal.show()
    };

    $scope.prepareForEdit = function(index) {
        currentEditIndex = index;

        $scope.editedQuote.text = $scope.data.quotes[index].text;
        $scope.editedQuote.author = $scope.data.quotes[index].author;
        $scope.editedQuote.num = $scope.data.quotes[index].num;
        $scope.tags = $scope.data.quotes[index].tags;

        $scope.editModal.show();
        $ionicListDelegate.closeOptionButtons();

    };

    $scope.editQuote = function(quote) {
        if (currentEditIndex != null) {

            $scope.data.quotes[currentEditIndex].text = quote.text;
            $scope.data.quotes[currentEditIndex].author = quote.author;
            $scope.data.quotes[currentEditIndex].num = quote.num;
            $scope.data.quotes[currentEditIndex].tags = $scope.tags;
            if ($scope.data.quotes[currentEditIndex].timestamps.length != quote.num){
            $scope.data.quotes[currentEditIndex].timestamps = getTimestamps(quote.num);
            }
            $scope.editModal.hide();

        }
    };

    $scope.removeQuote = function(index) {
        $scope.data.quotes.splice(index, 1)
        $ionicListDelegate.closeOptionButtons();
    };

    $scope.editSelected = function(index) {
        if ($scope.tags.indexOf(index)) {
            $scope.tags.splice(index, 1);
        }
    };

    $scope.addTag = function(input) {
        if (input.length > 0) {
            if ($scope.tags == undefined) {
                $scope.tags = [];
            }
            if ($scope.tags.indexOf(input) == -1) {
                $scope.tags.push(input.toLowerCase());
            }
        } else {
            alert("You can't enter a blank category!");
        }
    };

    $scope.logout = function() {
        fb.unauth();
        $location.path("/login")
    };

    //create and edit modals
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



});