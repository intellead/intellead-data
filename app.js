'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var app = express();
var request = require('request');
var Dao = require('./src/Dao');
var MailService = require('./src/MailService');

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
                var mailService = new MailService();
                mailService.sendMail('[intellead-data] service [/rd-webhook] is in error ', err);
                return res.sendStatus(400);
            }
            request.post('https://intellead-enrich.herokuapp.com/lead-enrichment', { json: { lead: lead } });
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

app.post('/lead-info', function(req, res){
    var lead_id = req.body.lead_id;
    var dao = new Dao();
    dao.findLead(lead_id, function (err, lead) {
        if (err) {
            return res.sendStatus(400);
        }
        if (lead) {
            return res.status(200).send(lead);
        }
    });
});

router.get('/lead-info', function(req, res, next) {
    res.sendStatus(200);
});

app.post('/update-enriched-lead-information', function(req, res){
    var lead_id = req.body.lead_id;
    var rich_information = req.body.rich_information;
    var dao = new Dao();
    dao.updateEnrichedLeadInformation(lead_id, rich_information, function (err, result) {
        if (err) {
            var mailService = new MailService();
            mailService.sendMail('[intellead-data] service [/update-enriched-lead-information] is in error ', err);
            return res.sendStatus(400);
        }
        if (result) {
            return res.sendStatus(200);
        }
    });
});

router.get('/update-enriched-lead-information', function(req, res, next) {
    res.sendStatus(200);
});

app.post('/update-enrich-attempts', function(req, res){
    var lead_id = req.body.lead_id;
    var attempts = req.body.attempts;
    var dao = new Dao();
    dao.updateEnrichAttempts(lead_id, attempts, function (err, result) {
        if (err) {
            var mailService = new MailService();
            mailService.sendMail('[intellead-data] service [/update-enrich-attempts] is in error ', err);
            return res.sendStatus(400);
        }
        if (result) {
            return res.sendStatus(200);
        }
    });
});

router.get('/lead-to-enrich', function(req, res, next) {
    var dao = new Dao();
    var serviceName = req.body.enrichService;
    dao.findLeadsToEnrich(serviceName, function(error, result) {
       if (error) {
           var mailService = new MailService();
           mailService.sendMail('[intellead-data] service [/lead-to-enrich] is in error ', error);
           return res.sendStatus(400);
       }
       if (result) {
           return res.status(200).send(result);
       }
    });
});

app.post('/save-lead-status', function(req, res){
    var lead_id = req.body.lead_id;
    var lead_status = req.body.lead_status;
    if (!lead_id || !lead_status) {
        return res.sendStatus(400);
    }
    var lead_status_json = {
        'lead_status' : lead_status
    };
    new Dao().saveLeadStatus(lead_id, lead_status_json, function (err, result) {
        if (err) {
            var mailService = new MailService();
            mailService.sendMail('[intellead-data] service [/save-leadh-status] is in error ', err);
            return res.sendStatus(400);
        }
        if (result) {
            return res.sendStatus(200);
        }
    });
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