"use strict";

const path = require('path');
const fs = require('fs');
const { log } = require('../helpers/logger');

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
    log(`About to exit with code: ${code}`);
    try {
        log('close the database');
        if (database != undefined) {
            database.close();
            database = undefined;
        }

    } catch (err) {
        log('Error - could not close the connection with the database - err= ' + String(err));
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

var database = undefined;

function connectToMongoAtlas() {

    log('start connecting to Mongo ATLAS');
    return new Promise(function (resolve, reject) {

        if (database == undefined) {
            MongoClient.connect(uri, function (err, client) {
                if (err) {
                    log('Error while connecting to Mongo ATLAS - err= ' + String(err));
                    reject(err);
                } else {
                    log("Success - Mongo ATLAS is connected !!!");
                    database = client;
                    resolve(database);
                }
            });
        } else {
            log('Mongo ATLAS database is already connected');
            resolve(database);
        }
    });
}

function downloadFromMongoAtlas(databaseName, fileName) {

    return new Promise(function (resolve, reject) {

        // we assume that we are connected to Mongo ATLAS
        //console.log("connected to mongo ATLAS");
        //log("database name is = " + databaseName);
        //console.log("collection name is = " + collectionName);
        let client = database;
        let gridFSBucket = new mongodb.GridFSBucket(client.db(databaseName));
        try {
            let downloadStream = gridFSBucket.openDownloadStreamByName(fileName);
            downloadStream
                .pipe(fs.createWriteStream(path.join(__dirname, path.join('../public/temp', fileName))))
                .on('error', function (err) {
                    log('Error: during data transfer from Mongo ATLAS - err= ' + String(err));
                    client.close();
                    reject(err);
                })
                .on('finish', function () {
                    //log('done - download succeeded for file ' + fileName);
                    // do not close here the database
                    resolve(fileName);
                });
        } catch (err) {
            log("Error - during transfer from Mongo ATLAS - err= " + String(err));
            client.close();
            reject(err);
        }
    });
}


var uri = "mongodb://RobertPastor:Bobby1%26%26%26@raphael-pastor-mongodb-shard-00-00-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-01-mpykx.mongodb.net:27017,raphael-pastor-mongodb-shard-00-02-mpykx.mongodb.net:27017/admin?replicaSet=raphael-pastor-mongodb-shard-0&ssl=true";

module.exports.mongoUploadImages = function (databaseName, collectionName, folder) {

    return new Promise(function (resolve, reject) {

        if (folder == undefined) {
            log("Error - Folder must be defined to upload files to Mongo ATLAS !!!");
            reject('Folder must be defined!!!');
        }

        MongoClient.connect(uri, function (err, client) {
            if (err) {
                log('Error - during connection to Mongo ATLAS - err= ' + String(err));
                reject(err);
            }
            database = client;
            log("connected to mongo ATLAS");
            log("database name is = " + databaseName);
            log("collection name is = " + collectionName);
            let myImagesCollection = client.db(databaseName).collection(collectionName);

            // path of the image file
            let fileNames = [];
            fs.readdirSync(path.join(path.join(__dirname, '../public/images/raphael'), folder)).forEach(fileName => {
                log('file found in folder = ' + fileName)
                fileNames.push(fileName);
            })

            let promises = fileNames.map(function (fileName) {
                log('looping through files in map - fileName= ' + fileName);
                let imagePath;
                if ((folder) && (String(folder).length > 0)) {
                    imagePath = path.join(__dirname, path.join('../public/images/raphael', path.join(folder, fileName)));

                } else {
                    imagePath = path.join(__dirname, path.join('../public/images/raphael', fileName));
                }

                if (fs.existsSync(imagePath)) {
                    // Do something
                    log('file = ' + String(imagePath) + ' -- is existing !!!');

                    let gridFSBucket = new mongodb.GridFSBucket(client.db(databaseName));
                    let readStream = fs.createReadStream(imagePath);
                    if (readStream) {

                        readStream
                            .pipe(gridFSBucket.openUploadStream(fileName))
                            .on('error', function (err) {
                                log('Error dugin data transfer - err= ' + String(err));
                                reject(err);
                            }).
                            on('finish', function () {
                                log('file correctly uploaded to Mongo ATLAS  - ' + fileName);
                                resolve(fileName);
                            });
                    } else {
                        log('Stream not created !!!');
                        reject("Stream Not created!!!");
                    }

                } else {
                    log('File = ' + imagePath + ' not found');
                    reject('Error - file ' + imagePath + ' not found!!!');
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

module.exports.mongoConnect = connectToMongoAtlas;

/**
 * Read one image - download it from mongo ATLAS
 * @param {*} databaseName 
 * @param {*} collectionName 
 * @param {*} fileName 
 */
module.exports.mongoReadImage = function (databaseName, collectionName, fileName) {

    //log('start reading image file - fileName= ' + fileName);
    return new Promise(function (resolve, reject) {

        if (database == undefined) {
            connectToMongoAtlas()
                .then(_ => {
                    // database is connected
                    downloadFromMongoAtlas(databaseName, fileName)
                        .then(results => {
                            log("Image file correctly downloaded = " + fileName);
                            resolve(fileName);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                })
        } else {
            // database is already connected
            downloadFromMongoAtlas(databaseName, fileName)
                .then(results => {
                    log("Image file correctly downloaded = " + fileName);
                    resolve(fileName);
                })
                .catch(err => {
                    reject(err);
                });
        }
    });
}

/**
 * close the connection to Mongo ATLAS
 */
module.exports.mongoClose = function () {
    try {
        // perform actions on the collection object
        //console.log("close the connection");
        if (database != undefined) {
            database.close();
        }
        database = undefined;
        log('Connection to Mongo ATLAS is now closed !!!');
    } catch (err) {
        log("failed to close the connection with the Mongo ATLAS database - err= " + String(err));
    }
}