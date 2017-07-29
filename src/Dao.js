'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI;
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
                    {"_id" : lead._id},
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

    findAllLeads(page_number, page_size, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').find()
                    .skip((page_number-1)*page_size)
                    .limit(page_size)
                    .sort({"created_at":-1})
                    .toArray(function(err, docs) {
                        if (err) {
                            console.log(err);
                            db.close();
                            return callback(err);
                        }
                        if (docs) {
                            db.close();
                            callback(err, docs);
                        }
                        db.close();
                    });
            }
        });
    }

    findLead(id, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').findOne({"_id" : id}, function(err, lead) {
                    if (err) {
                        console.log(err);
                        db.close();
                        return callback(err);
                    }
                    if (lead) {
                        db.close();
                        callback(err, lead);
                    }
                    db.close();
                });
            }
        });
    }

    updateEnrichedLeadInformation(lead_id, rich_information, callback) {
        new Dao().findLead(lead_id, function (err, result) {
            if (err) {
                return res.sendStatus(400);
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
                            {"_id": lead_id},
                            {"lead" : lead_enriched},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                    return callback(err);
                                }
                                if (result) {
                                    db.close();
                                    callback(err, lead);
                                }
                                db.close();
                            }
                        );
                    }
                });
            }
        });
    }

    updateEnrichAttempts(lead_id, attempts, callback) {
        new Dao().findLead(lead_id, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                let lead = result.lead;
                var lead_with_enrich_attempts = merge(lead, attempts);
                MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                        callback(err);
                    } else {
                        db.collection('leads').update(
                            {"_id": lead_id},
                            {"lead" : lead_with_enrich_attempts},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                    return callback(err);
                                }
                                if (result) {
                                    db.close();
                                    callback(err, lead);
                                }
                                db.close();
                            }
                        );
                    }
                });
            }
        });
    }

    findLeadsToEnrich(serviceName, callback) {
        var leadSericeEnrich = 'lead.'+serviceName;
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').find({ $or:[ { [leadSericeEnrich]: {"$exists": false} }, { [leadSericeEnrich]: { $lt: 2} } ] })
                .toArray(function(err, docs) {
                    if (err) {
                        console.log(err);
                        db.close();
                        return callback(err);
                    }
                    if (docs) {
                        db.close();
                        callback(err, docs);
                    }
                    db.close();
                });
            }
        });
    }

    saveLeadStatus(lead_id, lead_status, callback) {
        new Dao().findLead(lead_id, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                let lead = result.lead;
                var lead_with_lead_status = merge(lead, lead_status);
                MongoClient.connect(url, function (err, db) {
                    if (err) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                        callback(err);
                    } else {
                        db.collection('leads').update(
                            {"_id": lead_id},
                            {"lead" : lead_with_lead_status},
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                    return callback(err);
                                }
                                if (result) {
                                    db.close();
                                    callback(err, lead);
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
