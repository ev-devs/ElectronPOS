// or more concisely\
/*
var util = require('util')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { console.log(stdout) }
exec("ls -la", puts);*/


var fs = require('fs');
var ejs = require('ejs');

/*THIS RENDERS THE NAV*/
var nav = fs.readFileSync( __dirname + '/_nav.ejs', 'utf-8');
var rendered = ejs.render(nav, {});
$('nav').html(rendered)


/*THIS RENDERS THE MAIN*/
var internet = fs.readFileSync( __dirname + '/_index.ejs', 'utf-8');
var rendered = ejs.render(internet, {});
$('main').html(rendered)
