'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI;

class Dao {

    save(lead) {
        console.log(lead.id);
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                db.collection('leads').insertOne( {lead}, function(err, result) {
                    console.log("Inserted a document into the lead collection.");
                    db.close();
                });
            }
        });
    }

}
module.exports = Dao;
