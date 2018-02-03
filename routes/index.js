"use strict";

const path = require('path');
const fs = require('fs');
const mongo = require('./mongo');

//const fileNames = ["belle-du-desert.JPG", "arbre-mystique.JPG", "femme-a-la-cigarette.JPG", "soeurette.JPG", "lutin.JPG"];
//const fileNames = ["lutin.JPG", "madone-en-adoration.JPG"];
const fileNames = ["IMG_20180203_143201.JPG", "IMG_20180203_143228.JPG", "IMG_20180203_143243.JPG", "IMG_20180203_143304.JPG",
    "IMG_20180203_143311.JPG", "IMG_20180203_143317.JPG", "IMG_20180203_143325.JPG", "IMG_20180203_143411.JPG"];
const databaseName = "images";
const collectionName = "images";

module.exports = function (app) {

    app.get('/', (req, res) => {
        //console.log(req.hostname);
        res.render('pages/index');
    });

    app.get('/about', function (req, res) {
        res.render('pages/about');
    });

    app.get('/read/:imageFileName', function (req, res, next) {
        //console.log('starting downloading file from Mongo ATLAS= ' + req.params.imageFileName);
        res.setHeader('Content-Type', 'application/json');
        try {
            mongo.mongoReadImage(databaseName, collectionName, req.params.imageFileName)
                .then(result => {
                    res.send(JSON.stringify({ result: req.params.imageFileName }));
                })
                .catch(err => {
                    console.log('ERROR - during transfer - err= ' + String(err));
                    res.send(JSON.stringify({ result: err }));
                })
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
            res.send(JSON.stringify({ result: err }));
        }
    });

    app.get('/upload', function (req, res) {

        console.log('starting upload');
        try {
            let folder = "Corps";
            mongo.mongoUploadImages(databaseName, collectionName, folder, fileNames)
                .then(results => {
                    console.log("upload finished correctly!!!;")
                })
                .catch(err => {
                    console.log("Error during upload- err= " + String(err));
                })
            //mongo.mongoClose();
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }
        res.render('pages/done');
    });


}

module.exports.cleanTempFolder = function () {

    let tempFolder = path.join(__dirname, path.join('../public/temp'));
    //console.log("clean Temp folder= " + tempFolder);
    fs.readdir(tempFolder, (err, files) => {
        if (err) {
            console.log(err);
        } else {
            for (const file of files) {
                fs.unlink(path.join(tempFolder, file), err => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    });
}