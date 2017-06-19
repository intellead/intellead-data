'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://vinigomes:masterkey@ds131492.mlab.com:31492/heroku_blp06tvh';

class Dao {

    save(lead) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);
                var collection = db.collection('lead');
                collection.insertMany([lead], function(err, result) {
                    if (err) return console.log(err);
                    callback(result);
                });
                db.close();
            }
        });
    }

}
module.exports = Dao;
