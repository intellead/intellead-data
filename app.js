'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var router = express.Router();
var app = express();
var Dao = require('./src/Dao');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
    next();
});

app.use('/', router);

// Route that receives a POST request to /
app.post('/rd-webhook', function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    var dao = new Dao();
    for (var index in leads) {
        var lead = leads[index];
        lead._id = lead.id;
        delete lead.id;
        dao.saveAndUpdate(lead, function (err, result) {
            if (err) {
                return res.sendStatus(400);
            }
            res.sendStatus(200);
        });
    }
});

router.get('/rd-webhook', function(req, res, next) {
    res.sendStatus(200);
});

app.post('/all-leads', function(req, res){
    var page_number = parseInt(req.body.page_number),
        page_size = parseInt(req.body.page_size);
    //make a user validate with token and email
    var dao = new Dao();
    dao.findAllLeads(page_number, page_size, function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        if (result) {
            return res.status(200).send(result);
        }
    });
});

router.get('/all-leads', function(req, res, next) {
    res.sendStatus(200);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;