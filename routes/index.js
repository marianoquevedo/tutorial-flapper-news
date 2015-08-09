var express = require('express');
var moongose = require('mongoose');
var router = express.Router();

var postModel = moongose.model('Post');
var commentModel = moongose.model('Comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Posts Routes */
router.get('/posts', function (req, res, next) {

    process.stdout.write("pedido a /posts");

    postModel.find(function(err, posts){
        if (err) {
            return next(err);
        }

        res.json(posts);

    });
});

router.post('/posts', function(req, res, next) {
    var post = new postModel(req.body);

    post.save(function(err, post){
        if (err) {
            return next(err);
        }

        res.json(post);
    });
});

router.get('/post/:post', function(req, res) {

    req.post.populate('comments', function(err, post){

        if (err)
            return next(err);

        res.json(req.post);
    });
});

router.post('/posts/:post/upvote', function(req, res, next){
    req.post.upvote(function(err, post){
        if (err){
            return next(err);
        }

        res.json(post);
    });
});

// Creates a route for preloading post objects
//  Now when we define a route URL with :post in it, this function
//  will be run first. Assuming the :post parameter contains an ID,
//  our function will retrieve the post object from the database
//  and attach it to the req object after which the route handler
//  function will be called.
router.param('post', function(req, res, next, id) {

  console.log("query");

  var query = postModel.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

/* Comments Routes */
router.post('/post/:post/comments', function (req, res, next) {
    var comment = new commentModel(req.body);
    comment.post = req.post;

    comment.save(function (err, comment) {
        if (err) {
            return  next(err);
        }

        req.post.comments.push(comment);
        req.post.save(function (err, post) {
            if (err) {
                return  next(err);
            }

            res.json(comment);
        });
    });
});

router.param('comment', function(req, res, next, id) {
  var query = commentModel.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

router.put('/post/:post/comments/:comment/upvote', function (req, res, next) {
    req.comment.upvote(function(err, comment){
        if (err)
            return next(err);

        res.json(comment);
    });
});

module.exports = router;
