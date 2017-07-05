'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI;

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
                        console.log("Inserted a document into the lead collection with id: " + lead._id);
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


    updateEnrichedLeadInformation(id, rich_information, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                for (var property in rich_information) {
                    if (rich_information.hasOwnProperty(property)) {
                        if (typeof rich_information[property] == "object") {
                            updateEnrichedLeadInformation(id, rich_information[property]);
                        } else {
                            console.log("property: " + property);
                            console.log("value: " + rich_information[property]);
                            db.collection('leads').updateOne(
                                {   "_id" : id,
                                    "$or": [{ property: { "$exists": false } },{ property: null }]
                                },
                                { "$set": { property: rich_information[property]}},
                                function(err, lead) {
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
                    }
                }
            }
        });
    }

    percorrer(rich_information) {
        for (var property in rich_information) {
            if (rich_information.hasOwnProperty(property)) {
                if (typeof rich_information[property] == "object") {
                    percorrer(rich_information[property]);
                } else {

                    resultado.push(rich_information[property]);
                }
            }
        }
    }

}
module.exports = Dao;
