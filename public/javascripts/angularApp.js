var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
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

            $scope.posts.push({
                title: $scope.title,
                link: $scope.link,
                upvotes: 0,
                comments: [
                    {author: 'Joe', body: 'Cool post!', upvotes: 0},
                    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
                ]
            });

            $scope.title = '';
            $scope.link = '';
        };

        $scope.upvotePost = function(post){
            post.upvotes += 1;
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

app.factory('posts', [function(){
  // service body
  var output = {
    posts : [
        {title: 'post 1', link: '', upvotes: 5},
        {title: 'post 2', link: '', upvotes: 2},
        {title: 'post 3', link: '', upvotes: 15},
        {title: 'post 4', link: '', upvotes: 9},
        {title: 'post 5', link: '', upvotes: 4}
    ]
  };
  return output;
}]);