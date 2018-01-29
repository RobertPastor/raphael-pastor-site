"use strict";

const path = require('path');
const fs = require('fs');
const mongo = require('./mongo');

module.exports = function (app) {

    app.get('/', (req, res) => {
        //console.log(req.hostname);
        res.render('pages/index');
    });


    app.get('/about', function (req, res) {
        res.render('pages/about');
    });


    app.get('/read', function (req, res) {
        console.log('starting upload');
        let database = "images";
        let collection = "images";

        try {
            mongo.mongoReadImage(database, collection);
            //mongo.mongoClose();
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }

    });

    app.get('/upload', function (req, res) {

        console.log('starting upload');
        let database = "images";
        let collection = "images";
        try {
            mongo.mongoUploadImages(database, collection);
            //mongo.mongoClose();
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }
        res.render('pages/done');
    });



}