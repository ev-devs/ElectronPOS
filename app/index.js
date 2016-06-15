// or more concisely\
/*
var util = require('util')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { console.log(stdout) }
exec("ls -la", puts);*/


var fs = require('fs');
var ejs = require('ejs');

var file = fs.readFileSync( __dirname + '/_index.ejs', 'utf-8')
var rendered = ejs.render(file, {});
$('nav').html(rendered)
