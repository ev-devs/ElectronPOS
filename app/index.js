var util = require('util')
var execSync = require('child_process').execSync


/*
    1 connect to get wifi list
    2 connect to actual wifi
    3 display current connections
*/


var fs = require('fs');
var ejs = require('ejs');

var output = "";

/*This calls our function*/
function list_connections(){
    output = execSync('sudo ' + __dirname + '/../pw/wifi_script.sh')
    return output.toString('utf-8').split('\n');


}


/*THIS RENDERS THE NAV*/
var nav = fs.readFileSync( __dirname + '/_nav.ejs', 'utf-8');
var rendered = ejs.render(nav);
$('nav').html(rendered)


/*THIS RENDERS THE MAIN*/
var internet = fs.readFileSync( __dirname + '/_index.ejs', 'utf-8');
var rendered = ejs.render(internet, {output : list_connections()});
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
