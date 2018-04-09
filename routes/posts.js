var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment');

var Post = require('../models/post');


// TRANSFER ALL TRAFFIC TO /posts/view
router.get('/', function(req, res) {
    res.redirect('/posts/view');
});

// GET POSTS PAGE
router.get('/view', function(req, res) {
    // mongoose operations are asynchronous, so it will take time now
    Post.find({}, function (err, data) {
        // data is an array of objects, not a single object!
        res.render('view', {
            moment: moment,
            title: "Blog posts",
            alldata: data
        });
    }).sort({ posttimestamp: -1 });
});


// GET A 'NEW POST' PAGE (only for logged in users)
router.get('/newpost', ensureAuthenticated, function (req, res, next) {
    res.render('newpost', {title: 'New post'});
});

// GET A SINGLE POST OVERVIEW (only for logged in users)
router.get('/:id', ensureAuthenticated, function (req, res, next) {
    Post.find({_id: req.params.id }, function (err, data) {
        if (err) throw err;
        res.render('addcomment', {
            moment: moment,
            title: "Post a comment",
            selectedPost: data
            //postid: req.params.id
        });
    });
});

// AUTHENTICATION FUNCTION
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        var username = req.user.username;
        return next();

        //req.flash('error_msg', 'You are logged in');
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/signin');
    }
}


// ADDING A NEW POST
router.post('/newpost', function (req, res, next) {
    var posttitle = req.body.posttitle;
    var postcontent = req.body.postcontent;

    if (req.isAuthenticated()) {
        var username = req.user.username;
    }

    // VALIDATION
    req.checkBody('posttitle', 'Title is required').notEmpty();
    req.checkBody('postcontent', 'Content is required').notEmpty();

    var errors = req.validationErrors();
    var date = new Date(); // get current date & time

    if (errors) { // if there are validation errors, throw errors and return back to 'new post' page.
        res.render('newpost', {
            title: 'New post',
            errors: errors
        });
    } else { //if there are no errors


        var newPost = new Post({ // collect data together and set variables
            posttitle: posttitle,
            postcontent: postcontent,
            postauthor: username,
            posttimestamp: date,
            comments: {
                comment_content: ''
                /*comment_id: "",
                comment_user: "", //username
                comment_content: "",
                comment_timestamp: "" //date*/
            }
        });
        Post.addPost(newPost, function (err, post) { // add post
            if (err) throw err;
            //console.log(user + ' added')
        });
        req.flash('success_msg', 'Post has been successfully added.'); //show success message and redirect to all posts page
        res.redirect('/posts/view');
    }
});


// GET A 'NEW POST' PAGE (only for logged in users)
router.get('/addcomment/:id', ensureAuthenticated, function (req, res, next) {
    res.redirect('/posts/view');
});

// POST A COMMENT
router.post('/addcomment/:id', ensureAuthenticated, function (req, res, next) {
    var comment_content = req.body.comment_content;
    var postid = req.params.id;

    if (req.isAuthenticated()) {
        var username = req.user.username;
    }

    // VALIDATION
    req.checkBody('comment_content', 'Content is required').notEmpty();


    var errors = req.validationErrors();
    var date = new Date(); // get current date & time

    if (errors) { // if there are validation errors, throw errors and return back to 'new post' page.
        res.render('addcomment', {
            title: 'New comment',
            errors: errors
        });
    } else { //if there are no errors


        Post.findById(req.params.id, function(err, post) {
            if (!post)
                return next(new Error('Could not load Document'));
            else {
                var comment = {
                    //comment_id: "1",
                    comment_user: username,
                    comment_content: comment_content,
                    comment_timestamp: date
                };

                Post.update({_id: req.params.id},
                    { $push: {comments: comment }
                    }, function (err, data) { // update post
                        if (err) throw err;
                    });

                post.modified = new Date();

                post.save(function(err) {
                    if (err)
                        console.log('error')
                    else
                        console.log('success')
                });
            }
        });

        req.flash('success_msg', 'Comment has been added.'); //show success message and redirect to all posts page
        res.redirect('/posts/view');
    }
});

module.exports = router;
