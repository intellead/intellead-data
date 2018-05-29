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

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI || 'mongodb://intellead-data-mongodb:27017/local';
var _ = require('lodash');

function customizerEmptyFields(objValue, srcValue) {
    return _.isUndefined(objValue) || _.isNull(objValue) ? srcValue : objValue;
}

var mergeEmptyFields = _.partialRight(_.assignInWith, customizerEmptyFields);
var merge = _.partialRight(_.assignInWith);


class Dao {

    saveAndUpdate(lead, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').updateOne(
                    {$and : [{"_id" : lead._id}, {"lead.customer" : lead.customer}]},
                    {lead},
                    {upsert : true},
                    function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        db.close();
                        callback(err, result);
                    }
                );
            }
        });
    }

    findLead(customer, id, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').findOne(
                    {$and : [{"_id" : id}, {"lead.customer" : customer}]},
                    function(err, lead) {
                        if (err) {
                            console.log(err);
                            db.close();
                            return callback(err);
                        }
                        if (lead) {
                            db.close();
                            return callback(err, lead);
                        }
                        db.close();
                        return callback();
                    }
                );
            }
        });
    }

    findLeadByEmail(customer, email, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').findOne(
                    {$and : [{"lead.email" : email}, {"lead.customer" : customer}]},
                    function(err, lead) {
                    if (err) {
                        console.log(err);
                        db.close();
                        return callback(err);
                    }
                    if (lead) {
                        db.close();
                        return callback(err, lead);
                    }
                    db.close();
                    return callback();
                });
            }
        });
    }

    updateEnrichedLeadInformation(customer, lead_id, rich_information, callback) {
        new Dao().findLead(customer, lead_id, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                let lead = result.lead;
                var lead_enriched = mergeEmptyFields(lead, rich_information);
                MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                        callback(err);
                    } else {
                        db.collection('leads').update(
                            {$and : [{"_id" : lead_id}, {"lead.customer" : customer}]},
                            {"lead" : lead_enriched},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                    return callback(err);
                                }
                                if (result) {
                                    db.close();
                                    return callback(err, lead);
                                }
                                db.close();
                            }
                        );
                    }
                });
            } else {
                return callback();
            }
        });
    }

    updateEnrichAttempts(customer, lead_id, attempts, callback) {
        new Dao().findLead(customer, lead_id, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                let lead = result.lead;
                var lead_with_enrich_attempts = merge(lead, attempts);
                MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                        return callback(err);
                    } else {
                        db.collection('leads').update(
                            {$and : [{"_id" : lead_id}, {"lead.customer" : customer}]},
                            {"lead" : lead_with_enrich_attempts},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                    return callback(err);
                                }
                                if (result) {
                                    db.close();
                                    return callback(err, lead);
                                }
                                db.close();
                            }
                        );
                    }
                });
            } else {
                return callback();
            }
        });
    }

    saveLeadStatus(customer, lead_id, lead_status, callback) {
        new Dao().findLead(customer, lead_id, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                let lead = result.lead;
                var lead_with_lead_status = merge(lead, lead_status);
                MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                        return callback(err);
                    } else {
                        db.collection('leads').update(
                            {$and : [{"_id" : lead_id}, {"lead.customer" : customer}]},
                            {"lead" : lead_with_lead_status},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                    return callback(err);
                                }
                                if (result) {
                                    db.close();
                                    return callback(err, lead);
                                }
                                db.close();
                            }
                        );
                    }
                });
            }
        });
    }


}
module.exports = Dao;
