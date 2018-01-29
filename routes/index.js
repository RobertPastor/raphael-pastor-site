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
            mongo(database, collection);
        } catch (err) {
            console.log('ERROR - connection failed - err= ' + String(err));
        }

        // path of the image file
        let fileNames = ["belle-du-desert.JPG", "arbre-mystique.JPG", "femme-a-la-cigarette.JPG", "soeurette.JPG"];
        fileNames.map(function (fileName) {
            console.log(fileName);
            let imagePath = path.join(__dirname, path.join('../public/images/raphael', fileName));
            if (fs.existsSync(imagePath)) {
                // Do something
                console.log('file = ' + String(imagePath) + ' -- is existing !!!');
            }
        });


    });



}