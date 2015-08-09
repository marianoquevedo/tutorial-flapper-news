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
            });

        $urlRouterProvider.otherwise('home');
    }
]);

app.controller('MainCtrl', [ '$scope', 'posts',
    function($scope, postsService) {

        $scope.posts = postsService.posts;

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

app.controller('PostsCtrl', [ '$scope', 'post', 'posts',
    function($scope, post, postsService) {
        $scope.post = post;

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

app.factory('posts', ['$http', function($http){

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
        return $http.post('/posts', post).success(function (createdPost){
            o.posts.push(createdPost);
        });
    };

    o.upvote = function (post) {
        var url = '/posts/' + post._id + '/upvote';
        console.log(url);
        return $http.put(url).success(function(data) {
            post.upvotes += 1;
        });
    };

    o.createComment = function (post, comment) {
        return $http.post('/post/' + post._id + '/comments', comment).success(function (createdComment){
            post.comments.push(createdComment);
        });
    };

    o.upvoteComment = function (post, comment) {
        var url = '/post/' + post._id + '/comments/' + comment._id  + '/upvote';
        console.log(url);
        return $http.put(url).success(function(editedComment) {
            comment.upvotes += 1;
        });
    };

    return o;
}]);