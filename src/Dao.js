'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI;
var _ = require('lodash');

function customizer(objValue, srcValue) {
    return _.isUndefined(objValue) || _.isNull(objValue) ? srcValue : objValue;
}

var merge = _.partialRight(_.assignInWith, customizer);


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
        var total_records;
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
                var lead_enriched = merge(lead, rich_information);
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


}
module.exports = Dao;
