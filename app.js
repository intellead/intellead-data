'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route that receives a POST request to /
app.post('/json', function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    console.log('[BODY] ' + body);
    console.log('[LEADS] ' + body["leads"]);
    console.log('[KEYS]' + Object.keys(body));
    console.log('[KEYS FROM LEADS]' + Object.keys(body["leads"]));
    var leads = body["leads"];
    for(var lead in leads) {
        console.log(lead);
    }
    //console.log('[NAME] ' + body["name"]);
    //console.log('[VALUES] ' + Object.values(body));
    res.sendStatus(200);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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