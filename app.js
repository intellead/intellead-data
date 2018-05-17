'use strict';

/*
 *
 * Copyright 2017 Softplan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

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
var enrichLeadEnrichmentUrl = process.env.ENRICH_LEAD_ENRICHMENT_URL || 'http://intellead-enrich:3000/lead-enrichment';
var securityUrl = process.env.SECURITY_URL || 'http://intellead-security:8080/auth';

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
    var token = req.header('token');
    request({ url: securityUrl + '/' + token}, function(error, response, authBody) {
        if (response.statusCode != 200) return res.sendStatus(403);
        var leads = req.body["leads"];
        if (!leads) return res.sendStatus(412);
        for (var index in leads) {
            var lead = leads[index];
            lead._id = lead.id;
            delete lead.id;
            lead.customer = JSON.parse(authBody).id;
            new Dao().saveAndUpdate(lead, function (err, result) {
                if (err) {
                    var mailService = new MailService();
                    mailService.sendMail('[intellead-data] service [/rd-webhook] is in error ', err);
                    return res.sendStatus(400);
                }
                request({
                    url: enrichLeadEnrichmentUrl,
                    method: 'POST',
                    headers: {token: token},
                    json: {lead: lead}
                });
                res.sendStatus(200);
            });
        }
    });
});

app.post('/lead-info', function(req, res){
    request({ url: securityUrl + '/' + req.header('token')}, function(error, response, authBody) {
        if (response.statusCode != 200) return res.sendStatus(403);
        var lead_id = req.body.lead_id;
        new Dao().findLead(JSON.parse(authBody).id, lead_id, function (err, lead) {
            if (err) {
                return res.sendStatus(400);
            }
            if (lead) {
                return res.status(200).send(lead);
            }
            return res.sendStatus(204);
        });
    });
});

app.post('/lead-info-by-email', function(req, res){
    request({ url: securityUrl + '/' + req.header('token')}, function(error, response, authBody) {
        if (response.statusCode != 200) return res.sendStatus(403);
        var email = req.body.email;
        new Dao().findLeadByEmail(JSON.parse(authBody).id, email, function (err, lead) {
            if (err) {
                return res.sendStatus(400);
            }
            if (lead) {
                return res.status(200).send(lead);
            }
            return res.sendStatus(204);
        });
    });
});

app.post('/update-enriched-lead-information', function(req, res){
    request({ url: securityUrl + '/' + req.header('token')}, function(error, response, authBody) {
        if (response.statusCode != 200) return res.sendStatus(403);
        var lead_id = req.body.lead_id;
        var rich_information = req.body.rich_information;
        new Dao().updateEnrichedLeadInformation(JSON.parse(authBody).id, lead_id, rich_information, function (err, result) {
            if (err) {
                var mailService = new MailService();
                mailService.sendMail('[intellead-data] service [/update-enriched-lead-information] is in error ', err);
                return res.sendStatus(400);
            }
            if (result) {
                return res.sendStatus(200);
            }
            return res.sendStatus(204);
        });
    });
});

app.post('/update-enrich-attempts', function(req, res){
    request({ url: securityUrl + '/' + req.header('token')}, function(error, response, authBody) {
        if (response.statusCode != 200) return res.sendStatus(403);
        console.log('/update-enrich-attempts');
        var lead_id = req.body.lead_id;
        console.log('lead_id: ' + lead_id);
        var attempts = req.body.attempts;
        console.log('attempts: ' + JSON.stringify(attempts));
        new Dao().updateEnrichAttempts(JSON.parse(authBody).id, lead_id, attempts, function (err, result) {
            if (err) {
                var mailService = new MailService();
                mailService.sendMail('[intellead-data] service [/update-enrich-attempts] is in error ', err);
                return res.sendStatus(400);
            }
            if (result) {
                return res.sendStatus(200);
            }
            return res.sendStatus(204);
        });
    });
});

app.post('/save-lead-status', function(req, res){
    request({ url: securityUrl + '/' + req.header('token')}, function(error, response, authBody) {
        if (response.statusCode != 200) return res.sendStatus(403);
        var lead_id = req.body.lead_id;
        var lead_status = req.body.lead_status;
        if (!lead_id || !lead_status) {
            return res.sendStatus(400);
        }
        var lead_status_json = {
            'lead_status': lead_status['value'],
            'lead_status_proba': lead_status['proba']
        };
        new Dao().saveLeadStatus(JSON.parse(authBody).id, lead_id, lead_status_json, function (err, result) {
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
