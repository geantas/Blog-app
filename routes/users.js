var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment');

var User = require('../models/user');

/* // GET USERS LISTING
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});*/

// REGISTER USER ROUTE
router.get('/register', function (req, res, next) {
    //res.render('signin', {title: 'Register user', err: null});
    res.redirect('/users/signin');
});

// LOGIN ROUTE
router.get('/login', function (req, res, next) {
    //res.render('signin', {title: 'User login'});
    res.redirect('/users/signin');
});

// PROFILE ROUTE
router.get('/profile', function (req, res, next) {
    //res.render('signin', {title: 'User profile'});
    res.redirect('/users/signin');
});

router.get('/signin', function (req, res, next) {
    res.render('signin', {title: 'User Sign In'});
});


// REGISTER USER (on POST)
router.post('/signin', function (req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // VALIDATION
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


    var errors = req.validationErrors();

    if (errors) {
        res.render('signin', {
            errors: errors
        });
    } else {

        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;

            //console.log(user + ' added')
        });
        req.flash('success_msg', 'You are registered and can now login');
        res.redirect('/users/signin');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        /*User.findOne({ username: username }, function(err, user) {
              if (err) { return done(err); }
              if (!user) {
                  return done(null, false, { message: 'Incorrect username.' });
              }
              if (!user.validPassword(password)) {
                  return done(null, false, { message: 'Incorrect password.' });
              }
              return done(null, user);
          });*/

        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Invalid username and/or password'}); // unknown user
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user, {message: 'Successfully logged in'});
                } else {
                    return done(null, false, {message: 'Invalid username and/or password'}); // invalid password
                }
            });
        });

    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/signin', failureFlash: true}),
    function (req, res) {

        res.redirect('/');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        //res.redirect('/users/' + req.user.username);
    });


router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/signin');
});

module.exports = router;
