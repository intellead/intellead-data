'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI;

class Dao {

    save(lead) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                db.collection('leads').updateOne(
                    {"_id" : lead.id},
                    {lead},
                    {upsert : true},
                    function(err, result) {
                        console.log("Inserted a document into the lead collection with id: " + lead.id);
                        db.close();
                    }
                );
                // db.collection('leads').insertOne( {lead}, function(err, result) {
                //     console.log("Inserted a document into the lead collection with id: " + lead.id);
                //     db.close();
                // });
            }
        });
    }

}
module.exports = Dao;

db.people.update(
    { name: "Andy" },
    {
        name: "Andy",
        rating: 1,
        score: 1
    },
    { upsert: true }
)
