var createError = require('http-errors');
var express = require('express');
var expressValidator = require('express-validator');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var moment = require('moment');
var logger = require('morgan');
var engine = require('ejs-locals');


mongoose.connect('mongodb://localhost/Blog');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts')

var app = express();

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');


// Middleware (?)
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// EXPRESS SESSION
app.use(session({
    secret: 'shhhhh!',
    saveUninitialized: true,
    resave: true
}));

// PASSPORT INIT
app.use(passport.initialize());
app.use(passport.session());


// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
          , root = namespace.shift()
          , formParam = root;

      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
          msg: msg,
          value: value
      };
}
}));


// Connect Flash Middleware
app.use(flash());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development (original)
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page (original)
    //res.status(err.status || 500);
    //res.render('error');

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


// Middleware ROUTES
app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);


app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function(){
  console.log('server started on port ' + app.get('port'));
});

module.exports = app;
