"use strict";

const path = require('path');
const fs = require('fs');
const mongo = require('./mongo');

const fileNames = ["belle-du-desert.JPG", "arbre-mystique.JPG", "femme-a-la-cigarette.JPG", "soeurette.JPG"];
const databaseName = "images";
const collectionName = "images";

module.exports = function (app) {

    app.get('/', (req, res) => {
        console.log(req.hostname);
        res.render('pages/index');
    });

    app.get('/about', function (req, res) {
        res.render('pages/about');
    });


    app.get('/read', function (req, res, next) {
        console.log('starting upload');
        try {
            mongo.mongoReadImages(databaseName, collectionName, fileNames);
            //mongo.mongoClose();
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }
        res.redirect('/');
    });

    app.get('/upload', function (req, res) {

        console.log('starting upload');

        try {
            mongo.mongoUploadImages(databaseName, collectionName, fileNames);
            //mongo.mongoClose();
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }
        res.render('pages/done');
    });

}