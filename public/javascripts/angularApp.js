var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function(posts){
                        return posts.getAll();
                    }]
                }
            })
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl'
            });

        $urlRouterProvider.otherwise('home');
    }
]);

app.controller('MainCtrl', [ '$scope', 'posts',
    function($scope, postsService) {
        $scope.test = 'Hello world!';

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

app.controller('PostsCtrl', [ '$scope', '$stateParams', 'posts',
    function($scope, $stateParams, postsService) {
        var postId = $stateParams.id;
        $scope.post = postsService.posts[postId];

        $scope.addComment = function () {

            if ($scope.body.length === 0)
                return;

            $scope.post.comments.push({
                author: 'user',
                body: $scope.body,
                upvotes: 0,
            });

            $scope.author = '';
            $scope.body = '';
        };
    }
]);

app.factory('posts', ['$http', function($http){

  var o = {
    posts : []
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
    return $http.post(url).success(function(data) {
        post.upvotes += 1;
    });
  };

  return o;
}]);