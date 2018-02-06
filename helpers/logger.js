'use strict'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const path = require('path');

function getLoggerFunctionLine() {
    let errorStack = (new Error().stack);
    let logLineDetails = (errorStack.split("at ")[3]).trim();
    return logLineDetails;
}

Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, {});
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function () {
        return __stack[3].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: function () {
        let stack = __stack;
        return __stack[3].getFunctionName();
    }
});

Object.defineProperty(global, '__fileName', {
    get: function () {
        return __stack[3].getFileName();
    }
});

module.exports = {

    log: function (data) {

        let dateTime = new Date();
        var date_options = { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Paris", hour12: false };
        //console.log ( dateTime.toLocaleTimeString("fr-FR", date_options)  + ' - ' + data);
        let strMessage = '';
        strMessage = days[dateTime.getDay()] + ', ' + months[dateTime.getMonth()] + ' ' + dateTime.getDate() + ', ' + dateTime.getFullYear();
        strMessage += ', ';
        strMessage += String('00' + dateTime.getHours()).slice(-2);
        strMessage += ':' + String('00' + dateTime.getMinutes()).slice(-2);
        strMessage += ':' + String('00' + dateTime.getSeconds()).slice(-2);
        //strMessage += ' - ' + getLoggerFunctionLine();
        strMessage += ' - ' + String(path.basename(__fileName)) + '[' + String(__line) + ']';
        strMessage += ' - ' + String(data);
        console.log(strMessage);
    }
}






