/**
 * read XML input files
 */
const { log } = require('../helpers/log');
const fs = require('fs');
const path = require('path');
const sax = require('sax');
var componentData = {};

const knownXmlTags = ['SwMaturityIdCard', 'git', 'Doors', 'ClearQuest', 'component', 'repo', 'project', 'doorsComponent', 'baseline', 'base', 'assigned', 'detectedRelease', 'inworking', 'deleted'];

module.exports = {

    readXml: function (xmlConfigurationFile) {

        return new Promise(function (resolve, reject) {

            // issue around arrival order of the tags
            log("xml reader start");
            try {
                log(xmlConfigurationFile);
                if (!fs.existsSync(xmlConfigurationFile)) {
                    reject("XML file= " + xmlConfigurationFile + " --- does not exist !!!");
                }
            } catch (err) {
                reject("file= " + xmlConfigurationFile + ' --- does not exist !!!');
            }
            let strict = true;
            let options = {};
            var saxStream = sax.createStream(strict, options)
            saxStream.on("error", function (err) {
                // unhandled errors will throw, since this is a proper node
                // event emitter.
                console.error("error!", err);
                // clear the error
                this._parser.error = null;
                this._parser.resume();
                reject(err);
            });
            saxStream.on("opentagstart", function (tag) {
                //log('start tag - tag name= ' + tag.name);
                if (String(tag.name).toLowerCase() === 'SwMaturityIdCard'.toLowerCase()) {
                    componentData['git'] = [];
                    componentData['doors'] = {};
                    componentData['ClearQuest'] = {};
                }
                if (String(tag.name).toLowerCase() === 'git') {
                    // there might be several git repositories for one component
                    componentData['git'] = [];
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("GIT Project= " + tag.attributes['name']);
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'Doors'.toLowerCase()) {
                    componentData['doors'] = {};
                }
                if (String(tag.name).toLowerCase() === 'ClearQuest'.toLowerCase()) {
                    componentData['ClearQuest'] = {};
                }
            });
            saxStream.on("end", function () {
                //log(componentData);
                log("xml parsing is finished !!!");
                resolve(componentData);
            });
            saxStream.on("opentag", function (tag) {
                if (knownXmlTags.indexOf(String(tag.name)) === -1) {
                    // tag is unknown
                    log("XML parsing -- tag= " + tag.name + " is unknown -- warning -- XML tags are case sensitive");
                    process.exit();
                }
                //log(tag.name);
                if (String(tag.name).toLowerCase() === 'component'.toLowerCase()) {
                    //log("---> tag with name COMPONENT found !!!");
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("component name= " + tag.attributes['name']);
                            componentData['name'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'repo'.toLowerCase()) {
                    //log("---> tag with name REPO found !!!");
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("value")) {
                            log("GIT repo= " + tag.attributes['value']);
                            // we assume that a GIT tag has been found before
                            componentData['git'].push(tag.attributes['value']);
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'project'.toLowerCase()) {
                    //log("---> tag with name PROJECT (DOORS) found !!!");
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("DOORS Project= " + tag.attributes['name']);
                            // we assume that a GIT tag has been found before
                            componentData['doors']['project'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'doorsComponent'.toLowerCase()) {
                    //log("---> tag with name DoorsComponent (DOORS) found !!!");
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("DOORS Component= " + tag.attributes['name']);
                            // we assume that a GIT tag has been found before
                            componentData['doors']['component'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'baseline'.toLowerCase()) {
                    if (tag.attributes) {
                        if (tag.attributes.hasOwnProperty("name")) {
                            componentData['doors']['baseline'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'inworking'.toLowerCase()) {
                    if (tag.attributes) {
                        if (tag.attributes.hasOwnProperty("name")) {
                            componentData['doors']['inworking'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'deleted'.toLowerCase()) {
                    if (tag.attributes) {
                        if (tag.attributes.hasOwnProperty("name")) {
                            componentData['doors']['deleted'] = tag.attributes['name'];
                        }
                    }
                }

                if (String(tag.name).toLowerCase() === 'base'.toLowerCase()) {
                    //log("---> tag with name BASE (ClearQuest) found !!!");
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("ClearQuest BASE= " + tag.attributes['name']);
                            // we assume that a ClearQuest tag has been found before
                            componentData['ClearQuest']['base'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'assigned'.toLowerCase()) {
                    //log("---> tag with name ASSIGNED (ClearQuest) found !!!");
                    if (tag.attributes) {
                        //log(" the tag " + tag.name + "  --- has attributes ");
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("ClearQuest Assigned= " + tag.attributes['name']);
                            // we assume that a ClearQuest tag has been found before
                            componentData['ClearQuest']['assigned'] = tag.attributes['name'];
                        }
                    }
                }
                if (String(tag.name).toLowerCase() === 'detectedRelease'.toLowerCase()) {
                    if (tag.attributes) {
                        if (tag.attributes.hasOwnProperty("name")) {
                            log("ClearQuest DetectedRelease= " + tag.attributes['name']);
                            // we assume that a ClearQuest tag has been found before
                            componentData['ClearQuest']['detectedRelease'] = tag.attributes['name'];
                        }
                    }
                }
            })
            fs.createReadStream(xmlConfigurationFile)
                .pipe(saxStream);
        });
    }
}