"use strict";

const path = require('path');
const fs = require('fs');
const mongo = require('./mongo');
const { log } = require('../helpers/logger');

//const fileNames = ["belle-du-desert.JPG", "arbre-mystique.JPG", "femme-a-la-cigarette.JPG", "soeurette.JPG", "lutin.JPG"];
//const fileNames = ["lutin.JPG", "madone-en-adoration.JPG"];
//const fileNames = ["IMG_20180203_143201.JPG", "IMG_20180203_143228.JPG", "IMG_20180203_143243.JPG", "IMG_20180203_143304.JPG",
//    "IMG_20180203_143311.JPG", "IMG_20180203_143317.JPG", "IMG_20180203_143325.JPG", "IMG_20180203_143411.JPG"];
const databaseName = "images";
const collectionName = "images";

module.exports = function (app) {

    app.get('/', (req, res) => {
        log(req.hostname);
        res.render('pages/index');
    });

    app.get('/about', function (req, res) {
        res.render('pages/about');
    });

    /**
     * function called to download an image from MONGO ATLAS
     */
    app.get('/read/:imageFileName', function (req, res, next) {
        log('start downloading file from Mongo ATLAS= ' + req.params.imageFileName);
        res.setHeader('Content-Type', 'application/json');
        try {
            mongo.mongoReadImage(databaseName, collectionName, req.params.imageFileName)
                .then(_ => {
                    res.send(JSON.stringify({ results: req.params.imageFileName }));
                })
                .catch(err => {
                    log('Error - during transfer - err= ' + String(err));
                    res.send(JSON.stringify({ results: err }));
                })
        } catch (err) {
            log('Error - connection failed - err= ' + String(err));
            res.send(JSON.stringify({ results: err }));
        }
    });

    /**
     * function called to upload the images from local folder to Mongo ATLAS
     */
    app.get('/upload', function (req, res) {

        log('starting upload all the available files');
        try {
            let folder = "Portraits";
            mongo.mongoUploadImages(databaseName, collectionName, folder)
                .then(results => {
                    log("upload finished correctly to Mongo ATLAS - folder is = " + folder);
                })
                .catch(err => {
                    log("Error during upload to Mongo ATLAS - err= " + String(err));
                })
            //mongo.mongoClose();
        } catch (err) {
            log('Error - connection failed - err= ' + String(err));
        }
        res.render('pages/done');
    });

    app.get('/connect', function (req, res) {
        try {
            mongo.mongoConnect()
                .then(_ => {
                    log("mongo ATLAS DB is connected");
                    res.send(JSON.stringify({ results: true }));
                })
                .catch(err => {
                    log("Error during connection to Mongo ATLAS = " + String(err));
                    res.send(JSON.stringify({ results: err }));
                })
        } catch (err) {
            log("Error during connection to Mongo ATLAS = " + String(err));
            res.send(JSON.stringify({ results: err }));
        }
    });

    app.get('/close', function (req, res) {

        try {
            mongo.mongoClose();
            res.send(JSON.stringify({ results: true }));
        } catch (err) {
            log("Error during connection closure = " + String(err));
            res.send(JSON.stringify({ results: err }));
        }
    })

}

module.exports.cleanTempFolder = function () {

    let tempFolder = path.join(__dirname, path.join('../public/temp'));
    log("clean Temp folder= " + tempFolder);
    fs.readdir(tempFolder, (err, files) => {
        if (err) {
            console.log(err);
        } else {
            for (const file of files) {
                fs.unlink(path.join(tempFolder, file), err => {
                    if (err) {
                        console.log(err);
                    } else {
                        //log('file= ' + String(file) + ' -- deleted correctly ');
                    }
                });
            }
        }
    });
}