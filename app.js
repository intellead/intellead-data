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

// Route that receives a POST request to rd-webhook/
app.post('/rd-webhook', function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    var dao = new Dao();
    var mailService = new MailService();
    for (var index in leads) {
        var lead = leads[index];
        lead._id = lead.id;
        delete lead.id;
        dao.saveAndUpdate(lead, function (err, result) {
            if (err) {
                return res.sendStatus(400);
            }
            res.sendStatus(200);
            console.log('[ID]: ' + lead._id);
            var enrich_url = 'https://intellead-enrich.herokuapp.com/lead-enrichment';
            var json_enrich = {
                lead_id: lead._id
            };
            //data: json_enrich
            request({
                method: 'POST',
                url: enrich_url,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'cache-control': 'no-cache'
                },
                body: '{lead_id: 151680927}',
                data: json_enrich
            }, function (error, response, body) {
                if (error){
                    console.log(error);
                    mailService.sendMail('Enrich error', error);
                } else if (response.statusCode == 200) {
                    console.log('ENRICHED');
                    console.log(response.statusCode);
                    var classification_url = 'https://intellead-classification.herokuapp.com/lead_status/'+lead._id;
                    request({ url: classification_url, method: 'GET'}, function(error, response, body) {
                        if (error) {
                            mailService.sendMail('Classification error', error);
                        } else {
                            console.log(response.statusCode);
                            console.log('[LEAD_STATUS]: ' + response)
                            //persist the lead_status in lead
                        }
                    });
                }
            });
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
    var mailService = new MailService();
    //mailService.sendMail('Subject Test', 'Body Test')
});

router.get('/lead-info', function(req, res, next) {
    res.sendStatus(200);
});

app.post('/update-enriched-lead-information', function(req, res){
    console.log('/update-enriched-lead-information');
    var lead_id = req.body.lead_id;
    var rich_information = req.body.rich_information;
    var dao = new Dao();
    dao.updateEnrichedLeadInformation(lead_id, rich_information, function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        if (result) {
            console.log('/update-enriched-lead-information: '+ 200);
            return res.sendStatus(200);
        }
    });
});

router.get('/update-enriched-lead-information', function(req, res, next) {
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