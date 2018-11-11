var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mainRouter = require('./routes/main');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

var session = require('express-session');
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: 'cookieSecret word to encode', 
	cookie: { maxAge: 1000*60*60*8 }
}));




var xAdmin = require('express-admin');
var config = {
    dpath: './express-admin-master/config/',
    config: require('./express-admin-master/config/config.json'),
    settings: require('./express-admin-master/config/settings.json'),
    custom: require('./express-admin-master/config/custom.json'),
    users: require('./express-admin-master/config/users.json')
    // additionally you can pass your own session middleware to use
    //session: session({...})
};
xAdmin.init(config, function (err, admin) {
    if (err) return console.log(err);
    // web site
    //var app = express();
    // mount express-admin before any other middlewares
    app.use('/admin', admin);
    // site specific middlewares
    //app.use(express.bodyParser());
    // site routes
    /*app.get('/', function (req, res) {
        res.send('Hello World');
    });*/
    // site server
    /*app.listen(3000, function () {
        console.log('My awesome site listening on port 3000');
    });*/
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', mainRouter);
app.use('/users', usersRouter);
//app.use('/admin', adminRouter);
app.use('/admin', xAdmin.init);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
