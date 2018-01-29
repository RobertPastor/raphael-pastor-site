"use strict";


var database;

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
    try {
        database.close();
    } catch (err) {
        console.log('ERROR - could not close the database');
    }
});


module.exports = function (databaseName, collectionName) {

    var Db = require('mongodb').Db,
        MongoClient = require('mongodb').MongoClient,
        Server = require('mongodb').Server,
        ReplSetServers = require('mongodb').ReplSetServers,
        ObjectID = require('mongodb').ObjectID,
        Binary = require('mongodb').Binary,
        GridStore = require('mongodb').GridStore,
        Grid = require('mongodb').Grid,
        Code = require('mongodb').Code,
        assert = require('assert');
    const BSON = require('mongodb-core').BSON;

    // Set up the connection to mongo ATLAS
    var uri = "mongodb://bobby:bobbyonecannotbe@raphael-pastor-mongodb-shard-00-00-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-01-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-02-mpykx.mongodb.net:27017/images?replicaSet=raphael-pastor-mongodb-shard-0&ssl=true";

    uri = "mongodb+srv://RobertPastor:Bobby1%26%26%26@raphael-pastor-mongodb-mpykx.mongodb.net/images"

    MongoClient.connect(uri, function (err, client) {
        if (err) {
            console.log('ERROR - err= ' + String(err));
            throw err;
        }
        database = client;
        console.log("connected to mongo ATLAS");
        console.log("database name is = " + databaseName);
        console.log("collection name is = " + collectionName);
        var myImages = client.db(databaseName).collection(collectionName);
        console.log(myImages);
        // perform actions on the collection object
        console.log("close the connection");
        client.close();
    });

}