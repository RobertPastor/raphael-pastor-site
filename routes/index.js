"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');
const fs = require('fs');
const Grid = require('gridfs-stream');
const connection = require('./mongo');

module.exports = function (app) {

    app.get('/', (req, res) => {
        //console.log(req.hostname);
        res.render('pages/index');
    });


    app.get('/about', function (req, res) {
        res.render('pages/about');
    });


    app.get('/upload', function (req, res) {
        Grid.mongo = mongoose.mongo;
        connection('gridFS')
            .then(_ => {

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

            })
            .catch(err => {
                console.log(err);
            })



    });



}