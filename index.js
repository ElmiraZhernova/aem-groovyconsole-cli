#!/usr/bin/env node

'use strict'

const program = require('commander');
const GroovyConsoleApplication = require('./lib/GroovyConsoleApplication.js');

program
    .command('run')
    .description('Invoke Groovy script')
    .option('-h, --hostname  <hostname>', 'Hostname of AEM instance', 'http://localhost:4502')
    .option('-l, --login  <login>', 'AEM user login', 'admin')
    .option('-p, --password  <password>', 'AEM user password', 'admin')
    .option('-f, --file  <file>', 'Groovy file to invoke')
    .option('-m, --mode  <mode>', 'Use  all to run all groovy scripts in current directory')
    .option('-r, --result  <result>', 'Condition of showing the script result. Set \'true\' to see result')
    .option('-t, --time  <time>', 'Condition of showing the script running time. Set \'true\' to see time')
    .action(function(options) {
        new GroovyConsoleApplication().invokeGroovyScript(options);
    })

program.parse(process.argv);