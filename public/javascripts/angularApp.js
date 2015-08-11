var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function(posts) {
                        return posts.getAll();
                    }]
                }
            })
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function($stateParams, posts) {
                      return posts.get($stateParams.id);
                    }]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            });

        $urlRouterProvider.otherwise('home');
    }
]);

app.controller('NavigationCtrl', ['$scope', 'auth', function ($scope, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logout = auth.logout;
}]);

app.controller('MainCtrl', [ '$scope', 'posts', 'auth',
    function($scope, postsService, authService) {

        $scope.posts = postsService.posts;
        $scope.isLoggedIn = authService.isLoggedIn;

        $scope.addPost = function() {

            if(!$scope.title || $scope.title === '') {
                return;
            }

            postsService.create({
                title: $scope.title,
                link: $scope.link
            });

            $scope.title = '';
            $scope.link = '';
        };

        $scope.upvotePost = function(post){
            postsService.upvote(post);
        };
    }
]);

app.controller('PostsCtrl', [ '$scope', 'post', 'posts', 'auth',
    function($scope, post, postsService, authService) {

        $scope.post = post;
        $scope.isLoggedIn = authService.isLoggedIn;

        $scope.addComment = function () {

            if ($scope.body.length === 0)
                return;

            postsService.createComment(post, {
                author: 'user',
                body: $scope.body,
                upvotes: 0,
            });

            $scope.author = '';
            $scope.body = '';
        };

        $scope.upvoteComment = function(comment){
            postsService.upvoteComment($scope.post, comment);
        };
    }
]);

app.controller('AuthCtrl', ['$scope', '$state', 'auth', function ($scope, $state, auth) {
    $scope.user = {};

    $scope.register = function () {
        auth.register($scope.user).error(function(data) {
            $scope.error = data;
        }).then(function() {
            $state.go('home');
        });
    };

    $scope.login = function () {
        auth.login($scope.user).error(function (data) {
            $scope.error = data;
        }).then(function () {
            $state.go('home');
        });
    };

    $scope.logout = function () {
        auth.logout();
        $state.go('home');
    };
}]);

app.factory('posts', ['$http', 'auth', function($http, auth){

  var o = {
    posts : []
  };

    o.get = function(id) {
        return $http.get('/post/' + id).then(function (res) {
            return res.data;
        });
    };

    o.getAll = function() {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.posts);
        });
    };

    o.create = function (post) {
        return $http.post('/posts', post, {
            headers: { Authorization: 'Bearer '+ auth.getToken()}
        }).success(function (createdPost){
            o.posts.push(createdPost);
        });
    };

    o.upvote = function (post) {
        var url = '/posts/' + post._id + '/upvote';
        console.log(url);
        return $http.put(url, null , {
            headers: { Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data) {
            post.upvotes += 1;
        });
    };

    o.createComment = function (post, comment) {
        return $http.post('/post/' + post._id + '/comments', comment, {
            headers: { Authorization: 'Bearer '+ auth.getToken()}
        }).success(function (createdComment){
            post.comments.push(createdComment);
        });
    };

    o.upvoteComment = function (post, comment) {
        var url = '/post/' + post._id + '/comments/' + comment._id  + '/upvote';
        console.log(url);
        return $http.put(url, null, {
            headers: { Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(editedComment) {
            comment.upvotes += 1;
        });
    };

    return o;
}]);

app.factory('auth', ['$http', '$window', function ($http, $window){
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['flapperNews-token'] = token;
    };

    auth.getToken = function() {
        return $window.localStorage['flapperNews-token'];
    };

    auth.isLoggedIn = function() {
        var token = auth.getToken();

        if (token) {
            // the payload is the middle part of the token, and is base64 encoded
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };

    auth.login = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logout  = function() {
        $window.localStorage.removeItem('flapperNews-token');
    };

    return auth;
}]);