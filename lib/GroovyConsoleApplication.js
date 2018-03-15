'use strict'

var fs = require('fs');
var request = require('request');

module.exports = class GroovyConsoleApplication {

    invokeGroovyScript(options) {
        var self = this;
        var fileName = options.file;
        fileName ?
            fileName.endsWith('.groovy') ?
            this._runScript(fileName, options) :
            console.log('Wrong file extension! It should be .groovy') :
            options.mode === 'all' ?
            this._runAllScriptsInCurrentDirectory(options) :
            console.log('Please specify file name -f <file> or use option \'-m all\' to run all scripts in current directory');
    }

    _runAllScriptsInCurrentDirectory(options) {
        var self = this;
        fs.readdir(process.cwd(), (err, files) => {
            files.forEach(fileName => {
                self._runScript(fileName, options);
            });
        })
    }

    _runScript(fileName, options) {
        var self = this;
        if (fileName.endsWith('.groovy')) {
            fs.readFile(fileName, 'utf8', function(err, contents) {
                var jsonDataObj = {
                    'script': contents,
                    'data': ''
                };
                err ? console.log(err) : self._sendRequest(fileName, jsonDataObj, options);
            });
        }
    }

    _sendRequest(fileName, jsonDataObj, options) {
        var self = this;
        request.post({
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(options.login + ':' + options.password).toString('base64')
            },
            url: options.hostname + '/services/invoke/script',
            form: jsonDataObj
        }, function(error, response, body) {
            self._processResponse(fileName, response.statusCode, body, options.all);
        });
    }

    _processResponse(fileName, statusCode, body, all) {
        if (all) {
            console.log('----------------------------------');
            console.log('The output of script ' + fileName + ':');
        }
        console.log(body);
        if (statusCode !== 200) {
            console.log('Some error during request. Status code : ' + statusCode);
        }
    }
}