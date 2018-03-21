'use strict'

var fs = require('fs');
var request = require('request');
const chalk = require('chalk');
const warning = chalk.keyword('orange');
const errorMessage = chalk.keyword('red');
const help = chalk.keyword('gray');
const info = chalk.keyword('blue');
const success = chalk.rgb(0, 230, 0);

module.exports = class GroovyConsoleApplication {

    invokeGroovyScript(options) {
        var self = this;
        if (self._matchesHostnamePattern(options.hostname)) {
            var fileName = options.file;
            fileName ?
                fileName.endsWith('.groovy') ?
                this._runScript(fileName, options) :
                self._printHelp(warning('Wrong file extension! It should be .groovy')) :
                options.mode === 'all' ?
                this._runAllScriptsInCurrentDirectory(options) :
                self._printHelp(warning('Please specify file name -f <file> or use option \'-m all\' to run all scripts in current directory'));
        } else {
            self._printHelp(warning('Hostname \'' + options.hostname + '\' does not matches pattern. It must contain scheme (protocol) and should not include path. E.g : \'http://localhost:4502\''))
        }
    }

    _printHelp(message) {
        console.log(message);
        console.log(help('Supported commands : \n' +
            '-h, --hostname  <hostname>      Hostname of AEM instance (default: http://localhost:4502)\n' +
            '-l, --login  <login>            AEM user login (default: admin)\n' +
            '-p, --password  <password>      AEM user password (default: admin)\n' +
            '-f, --file  <file>              Groovy file to invoke script. File extension should be \'.groovy\'\n' +
            '-m, --mode  <mode>              Use  \'all\' to run all groovy scripts in current directory\n' +
            '-r, --result  <result>          Condition of showing the script result. Set \'true\' to see result\n' +
            '-t, --time  <time>              Condition of showing the script running time. Set \'true\' to see time\n'
        ));
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
                err ? self._printHelp(errorMessage(err)) : self._sendRequest(fileName, jsonDataObj, options);
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
            error ? self._printHelp(errorMessage(error)) : self._processResponse(fileName, response.statusCode, body, options);
        });
    }

    _matchesHostnamePattern(hostname) {
        var regex = /http[s]*:\/\/[^\/]+$/;
        return hostname.match(regex);
    }

    _processResponse(fileName, statusCode, body, options) {
        var allModeMessage = '----------------------------------\n' + 'The output of script ' + fileName + ':';
        this._printOutput(options.mode === 'all', allModeMessage);
        var jsonBody = JSON.parse(body);
        this._printOutput(jsonBody.output, this._parseOutput(jsonBody.output));
        this._printOutput(jsonBody.exception, errorMessage(jsonBody.exception));
        this._printOutput(options.result === 'true', 'Result:\n' + jsonBody.result);
        this._printOutput(options.time === 'true', 'Running time:\n' + jsonBody.running_time);
        this._printOutput(statusCode !== 200, errorMessage('Some error during request. Status code : ' + statusCode));
    }

    _parseOutput(output) {
        return output.replace(/(\n[\s]*warning\W)/gi, warning('$1'))
            .replace(/(\n[\s]*(error|exception)\W)/gi, errorMessage('$1'))
            .replace(/(\n[\s]*info\W)/gi, info('$1'))
            .replace(/(\n[\s]*success[fully]*\W)/gi, success('$1'))
    }
    _printOutput(condition, output) {
        if (condition) {
            console.log(output);
        }
    }
}