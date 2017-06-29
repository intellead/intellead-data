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

    findAllLeads(callback) {
        var page_size = 10;
        var N = 1;
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').find()
                                      .skip((N-1)*page_size)
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

}
module.exports = Dao;
