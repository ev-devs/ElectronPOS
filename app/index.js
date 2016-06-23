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
function remove_dup(wifis) {
  /*You may be wondering why? What the hell is this fam? Well it removes the second index of the wifis array because the second index is "" and that is annoying*/
  var i = wifis.indexOf("");
  if(i != -1) {
     wifis.splice(i, 1);
  }
  /*This new array will hold the wifis without duplicates. */
  var connections = [];
  /*We start at the bottom because by default the connections are sorted from lowets to highest connection quality
  with the worst connection being at the top and best at the bottom*/
  for(var i = wifis.length - 2; i > 1; i--) {
    console.log(wifis[i].substring(wifis[i].search("\""), wifis[i].length - 1));
    /*var wifi = {
      "essid" : wifis[i].substring(wifis.indexOf("ESSID:"), wifis.length - 1),
      "quality" : "Test"
    }*/
    //console.log(wifi.essid);
  }
}
/*This calls our function*/
function list_connections(){
    output = execSync('sudo ' + __dirname + '/../pw/wifi_script.sh').toString('utf-8').split('\n');
    remove_dup(output);
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
