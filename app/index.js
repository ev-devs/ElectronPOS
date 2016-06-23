var util = require('util')
var execSync = require('child_process').execSync

/*
function puts(error, stdout, stderr) {
    output = stdout;
    console.log(output)
}
*/ // this is for asynchrous exec

/*run this*/
var output = execSync("ls -la");

var fs = require('fs');
var ejs = require('ejs');

/*THIS RENDERS THE NAV*/
var nav = fs.readFileSync( __dirname + '/_nav.ejs', 'utf-8');
var rendered = ejs.render(nav, {output : output});
$('nav').html(rendered)


/*THIS RENDERS THE MAIN*/
var internet = fs.readFileSync( __dirname + '/_index.ejs', 'utf-8');
var rendered = ejs.render(internet, {});
$('main').html(rendered)

/*
THE COOL THING About electron is that you have full access to the node.js api
FROM THE HTML VIEW. (aka the render process). That means we can run a web server from within the index.html file. Check it
*/

var express = require('express');
var app = express();

app.get('/', function(req, res){
    res.send('hello world!');
    console.log('we in BROOO!');
});

app.listen(3000, function(){
    console.log('listening on port 3000');
});
