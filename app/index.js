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
     wifis.splice(i, 1);
  }
  /*This new array will hold the wifis without duplicates.*/
  var connections = [];
  /*We start at the bottom because by default the connections are sorted from lowest to highest connection quality
  with the worst connection being at the top and best at the bottom*/
  for(var i = wifis.length - 2; i > 1; i--) {
    /*Grabs the name of a connection from an index in the wifi array, excluidng the double quotes around the name*/
    var essid = wifis[i].substring(wifis[i].search("\"") + 1, wifis[i].lastIndexOf("\""));
    /*Grabs whether or not the connection needs a passkey, so either on or off*/
    var psk = wifis[i].substring(wifis[i].search(":o") + 1, wifis[i].search("ES") - 1);
    /*Combines them into one string*/
    var combined = essid + "~" + psk;
    /*If that string is not found within the connections array then put it in. If it is then exclude it. */
    if(connections.indexOf(combined) == -1) {
      connections.push(combined);
    }
  }
  return connections;
}

function JSONify(connections) {
  for(var i = 0; i < connections.length; i++) {
    var wifi = {
      "essid" : connections[i].substring(0, connections[i].search("~")),
      "psk" : connections[i].substring(connections[i].search("~") + 1, connections[i].length)
    }
    connections[i] = wifi;
  }
  return connections;
}
/*This calls our function*/
function list_connections(){
    /*Grabs the output ofthe script and makes it into an array*/
    output = execSync('sudo ' + __dirname + '/../pw/wifi_script.sh').toString('utf-8').split('\n');
    /*Removes any duplicate essids*/
    output = remove_dup(output);
    output = JSONify(output);
    return output
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
