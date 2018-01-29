"use strict";

const path = require('path');
const fs = require('fs');

var database;

const mongodb = require('mongodb');

const Db = require('mongodb').Db;
const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
const ReplSetServers = require('mongodb').ReplSetServers;
const ObjectID = require('mongodb').ObjectID;
const Binary = require('mongodb').Binary;
const GridStore = require('mongodb').GridStore;
const Grid = require('mongodb').Grid;
const Code = require('mongodb').Code;
const assert = require('assert');
const BSON = require('mongodb-core').BSON;

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
    try {
        console.log('close the database');
        database.close();
    } catch (err) {
        console.log('ERROR - could not close the database');
    }
});


var uri = "mongodb://RobertPastor:Bobby1%26%26%26@raphael-pastor-mongodb-shard-00-00-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-01-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-02-mpykx.mongodb.net:27017/admin?replicaSet=raphael-pastor-mongodb-shard-0&ssl=true";


module.exports.mongoUploadImages = function (databaseName, collectionName) {

    // Set up the connection to mongo ATLAS
    MongoClient.connect(uri, function (err, client) {
        if (err) {
            console.log('ERROR - err= ' + String(err));
            throw err;
        }
        database = client;
        console.log("connected to mongo ATLAS");
        console.log("database name is = " + databaseName);
        console.log("collection name is = " + collectionName);
        let myImagesCollection = client.db(databaseName).collection(collectionName);
        console.log(myImagesCollection);

        // path of the image file
        let fileNames = ["belle-du-desert.JPG", "arbre-mystique.JPG", "femme-a-la-cigarette.JPG", "soeurette.JPG"];
        let promises = fileNames.map(function (fileName) {
            console.log(fileName);
            let imagePath = path.join(__dirname, path.join('../public/images/raphael', fileName));
            if (fs.existsSync(imagePath)) {
                // Do something

                console.log('file = ' + String(imagePath) + ' -- is existing !!!');

                var gridFSBucket = new mongodb.GridFSBucket(client.db(databaseName));
                var readStream = fs.createReadStream(imagePath);
                if (readStream) {

                    readStream
                        .pipe(gridFSBucket.openUploadStream(fileName))
                        .on('error', function (error) {
                            console.log(String(error))
                            return new Promise.reject(error);
                        }).
                        on('finish', function () {
                            console.log('done! ' + fileName);
                            return new Promise(resolve(fileName));
                        });

                }
                return new Promise.reject("Stream Not created!!!");
            }
        });
        Promise
            .all(promises)
            .then(results => {
                console.log(results);
                console.log("all insertions done correctly !!!");
                client.close();
            })
            .catch(err => {
                console.log("Error - err = " + String(err));
                client.close();
            });
    });
}

module.exports.mongoReadImage = function (databaseName, collectionName) {

    console.log('read image');
    // Set up the connection to mongo ATLAS
    MongoClient.connect(uri, function (err, client) {
        if (err) {
            console.log('ERROR - err= ' + String(err));
            throw err;
        }
        database = client;
        console.log("connected to mongo ATLAS");
        console.log("database name is = " + databaseName);
        console.log("collection name is = " + collectionName);

        var gridFSBucket = new mongodb.GridFSBucket(client.db(databaseName));
        gridFSBucket.find().forEach(function (element) {
            console.log(element.filename);
            let downLoadingFileName = element.filename;
            var downloadStream = gridFSBucket.openDownloadStreamByName();

            downloadStream
                .pipe(fs.createWriteStream(path.join(__dirname, path.join('../temp', element.filename))))
                .on('error', function (error) {
                    console.log('Error: err= ', error);
                    client.close();
                })
                .on('finish', function () {
                    console.log('done - download for file ' + element.fileName);
                });

        });
        //console.log('close the database');
        //client.close();

    });

}


module.exports.mongoClose = function () {
    try {
        // perform actions on the collection object
        console.log("close the connection");
        database.close();
    } catch (err) {
        console.error("failed to close the database")
    }
}