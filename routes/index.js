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


    app.get('/upload', function (req, res) {

        console.log('starting upload');
        let database = "images";
        let collection = "images";
        try {
            mongo.mongoConnect(database, collection);
            //mongo.mongoClose();
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }
        res.render('pages/done');
    });



}