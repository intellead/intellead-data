'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var Dao = require('./src/Dao');
var MailService = require('./src/MailService');
var fs = require('fs');
var json2xls = require('json2xls');
var excel = require('exceljs');
const tempfile = require('tempfile');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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

app.post('/rd-webhook', function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    for (var index in leads) {
        var lead = leads[index];
        lead._id = lead.id;
        delete lead.id;
        new Dao().saveAndUpdate(lead, function (err, result) {
            if (err) {
                var mailService = new MailService();
                mailService.sendMail('[intellead-data] service [/rd-webhook] is in error ', err);
                return res.sendStatus(400);
            }
            request.post(process.env.ENRICH_LEAD_ENRICHMENT_URL, { json: { lead: lead } });
            res.sendStatus(200);
        });
    }
});

app.post('/all-leads', function(req, res){
    var page_number = parseInt(req.body.page_number),
        page_size = parseInt(req.body.page_size);
    new Dao().findAllLeads(page_number, page_size, function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        if (result) {
            return res.status(200).send(result);
        }
    });
});

app.post('/all-qualified-leads', function(req, res){
    var page_number = parseInt(req.body.page_number),
        page_size = parseInt(req.body.page_size);
    new Dao().findAllQualifiedLeads(page_number, page_size, function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        if (result) {
            return res.status(200).send(result);
        }
    });
});

app.get('/all-qualified-leads-excel', function(req, res){
    var page_number = 1,
        page_size = 9999;
    new Dao().findAllQualifiedLeads(page_number, page_size, function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        if (result) {
            try {
                var workbook = new excel.Workbook();
                var worksheet = workbook.addWorksheet('My Sheet');
                worksheet.columns = [
                    { header: 'Id', key: 'id', width: 10 },
                    { header: 'Name', key: 'name', width: 32 },
                    { header: 'Job title', key: 'job', width: 10 },
                    { header: 'Company', key: 'company', width: 10 },
                    { header: 'Phone', key: 'phone', width: 10 },
                    { header: 'E-mail', key: 'email', width: 10 }
                ];
                for (let index in result) {
                    worksheet.addRow({
                        id: result[index]['_id'],
                        name: result[index]['lead']['name'],
                        job: result[index]['lead']['job_title'],
                        company: result[index]['lead']['company'],
                        phone: result[index]['lead']['personal_phone'],
                        email: result[index]['lead']['email']
                    });
                }
                var tempFilePath = tempfile('.xlsx');
                workbook.xlsx.writeFile(tempFilePath).then(function() {
                    console.log('file is written');
                    res.sendFile(tempFilePath, function(err){
                        console.log('---------- error downloading file: ' + err);
                    });
                });
            } catch(err) {
                console.log('OOOOOOO this is the error: ' + err);
            }
        }
    });
});

app.post('/all-unqualified-leads', function(req, res){
    var page_number = parseInt(req.body.page_number),
        page_size = parseInt(req.body.page_size);
    new Dao().findAllUnqualifiedLeads(page_number, page_size, function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        if (result) {
            return res.status(200).send(result);
        }
    });
});

app.post('/lead-info', function(req, res){
    var lead_id = req.body.lead_id;
    new Dao().findLead(lead_id, function (err, lead) {
        if (err) {
            return res.sendStatus(400);
        }
        if (lead) {
            return res.status(200).send(lead);
        }
    });
});

app.post('/update-enriched-lead-information', function(req, res){
    var lead_id = req.body.lead_id;
    var rich_information = req.body.rich_information;
    new Dao().updateEnrichedLeadInformation(lead_id, rich_information, function (err, result) {
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

app.post('/update-enrich-attempts', function(req, res){
    console.log('/update-enrich-attempts');
    var lead_id = req.body.lead_id;
    console.log('lead_id: ' + lead_id);
    var attempts = req.body.attempts;
    console.log('attempts: ' + JSON.stringify(attempts));
    new Dao().updateEnrichAttempts(lead_id, attempts, function (err, result) {
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

app.get('/lead-to-enrich', function(req, res) {
    var serviceName = req.body.enrichService;
    new Dao().findLeadsToEnrich(serviceName, function(error, result) {
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
        'lead_status' : lead_status['value'],
        'lead_status_proba' : lead_status['proba']
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