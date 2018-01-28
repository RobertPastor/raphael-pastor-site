"use strict";


const mongoose = require('mongoose');

const allConnections = {};

module.exports = function (dbName) {

    mongoose.Promise = require('bluebird');

    const url = 'mongodb://localhost/' + dbName;
    let conn;
    console.log('initializing database connection to: ' + url);

    conn = allConnections[url];
    if (!conn) {
        console.log('creating new connection for ' + url);
        conn = mongoose.connect(url, {
            useMongoClient: true,
            autoReconnect: true,
            autoIndex: false,
            reconnectTries: Number.MAX_SAFE_INTEGER
        });
        // Log database connection events
        conn.on('connected', () => console.log('Mongoose connection open to ' + url));
        conn.on('error', (err) => console.log('Mongoose connection error: ' + err));
        conn.on('disconnected', () => console.log('Mongoose connection disconnected'));
        allConnections[url] = conn;
        return conn;
    }
    else {
        console.log('reusing existing connection for ' + url);
    }
    return conn;
}