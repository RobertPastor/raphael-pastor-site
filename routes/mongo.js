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


// flatten an array of Promises

const flatten = arr => arr.reduce((acc, item) => {

    if (Array.isArray(item)) {
        return acc.concat(flatten(item));
    } else if (item instanceof Promise) {
        return acc.concat(item);
    } else {
        return acc;
    }
}, [])


var uri = "mongodb://RobertPastor:Bobby1%26%26%26@raphael-pastor-mongodb-shard-00-00-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-01-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-02-mpykx.mongodb.net:27017/admin?replicaSet=raphael-pastor-mongodb-shard-0&ssl=true";

module.exports.mongoUploadImages = function (databaseName, collectionName, fileNames) {

    return new Promise(function (resolve, reject) {

        MongoClient.connect(uri, function (err, client) {
            if (err) {
                console.log('ERROR - err= ' + String(err));
                reject(err);
            }
            database = client;
            console.log("connected to mongo ATLAS");
            console.log("database name is = " + databaseName);
            console.log("collection name is = " + collectionName);
            let myImagesCollection = client.db(databaseName).collection(collectionName);
            //console.log(myImagesCollection);

            // path of the image file

            let promises = fileNames.map(function (fileName) {
                console.log(fileName);
                let imagePath = path.join(__dirname, path.join('../public/images/raphael', fileName));
                if (fs.existsSync(imagePath)) {
                    // Do something

                    console.log('file = ' + String(imagePath) + ' -- is existing !!!');

                    let gridFSBucket = new mongodb.GridFSBucket(client.db(databaseName));
                    let readStream = fs.createReadStream(imagePath);
                    if (readStream) {

                        readStream
                            .pipe(gridFSBucket.openUploadStream(fileName))
                            .on('error', function (err) {
                                console.log(String(err))
                                reject(err);
                            }).
                            on('finish', function () {
                                console.log('done! ' + fileName);
                                resolve(fileName);
                            });
                    }
                    reject("Stream Not created!!!");
                }
            });
            Promise.all(flatten(promises))
                .then(results => {
                    resolve(results)
                })
                .catch(err => {
                    resolve(err);
                })

        });
    });

}

/**
 * Read one image from mongo ATLAS
 * @param {*} databaseName 
 * @param {*} collectionName 
 * @param {*} fileName 
 */
module.exports.mongoReadImage = function (databaseName, collectionName, fileName) {

    //console.log('read image');
    return new Promise(function (resolve, reject) {

        // Set up the connection to mongo ATLAS
        MongoClient.connect(uri, function (err, client) {
            if (err) {
                console.log('ERROR - err= ' + String(err));
                reject(err);
            } else {
                database = client;
                //console.log("connected to mongo ATLAS");
                //console.log("database name is = " + databaseName);
                //console.log("collection name is = " + collectionName);
                let gridFSBucket = new mongodb.GridFSBucket(client.db(databaseName));

                let downloadStream = gridFSBucket.openDownloadStreamByName(fileName);
                downloadStream
                    .pipe(fs.createWriteStream(path.join(__dirname, path.join('../public/temp', fileName))))
                    .on('error', function (err) {
                        console.log('Error: err= ', err);
                        client.close();
                        reject(err);
                    })
                    .on('finish', function () {
                        //console.log('done - download for file ' + fileName);
                        client.close();
                        resolve(fileName);
                    });
            }
        });
    });

}


module.exports.mongoClose = function () {
    try {
        // perform actions on the collection object
        //console.log("close the connection");
        database.close();
    } catch (err) {
        console.error("failed to close the database")
    }
}