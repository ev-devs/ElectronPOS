var util = require('util')
var execSync = require('child_process').execSync
var exec = require('child_process').exec



var fs = require('fs');
var ejs = require('ejs');

var output = "";
var ap_name = "";
var psk = "";


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
    if(connections.indexOf(combined) == -1 && essid != "") {
      connections.push(combined);
    }
  }
  return connections;
}

/*Makes the eleemtns of the connections array into json objects, hence the stuid name*/
function JSONify(connections) {
  for(var i = 0; i < connections.length; i++) {
    /*Makes the elements of the array into JSON*/
    var wifi = {
      /*Takes the name of the connection*/
      "essid" : connections[i].substring(0, connections[i].search("~")),
      /*Takes the string that determines whether or not the conneciton require a passkey*/
      "psk" : connections[i].substring(connections[i].search("~") + 1, connections[i].length)
    }
    /*Overwrites the current index value with the JSON object*/
    connections[i] = wifi;
  }
  /*Runs the wifi_cur.sh script to get the output and store it as a string*/
  var cur = execSync('sudo '+ __dirname + '/../pw/wifi_cur.sh').toString();
  /*pushes it as the last element for easy access*/
  connections.push(cur);
  return connections;
}

/*This calls our function which lists connections*/
function list_connections(){
    return JSONify(remove_dup(execSync('sudo ' + __dirname + '/../pw/wifi_script.sh').toString('utf-8').split('\n')));
}

/*Simply grabs the name of the access point which is stored in two ways, as the id and the text of the <a> tag*/
$(document).on('click', '.wifi_option', function() {
  ap_name = $(this).attr('id');
});

/*Simply grabs the password and invokes the wifi_con script*/
/*$('#keyboard').click(function(event){
    console.log(event)
})*/
$(document).on('click', '#accept', function() {
  psk = $("#keyboard").val()
  /*Connects to the specified and waits for two seconds. The 2 second wait is to ensure that a connection is made or not.*/
  console.log(ap_name + psk);
  /*execSync("sudo ../pw/wifi_con.sh " + ap_name + " " + psk + " && sleep 2");*/
  //execSync("sudo ../pw/wifi_con.sh " + ap_name + " " + psk);

  /*If no connection is made then after running the wifi_cur.sh script again the word "none" will appear*/
  var cur = "Wi-Fi: " + execSync("sudo ../pw/wifi_cur.sh ").toString();
  /* **THIS LINE IS NOT YET TESTED ON THE RPI** */
  /**$("#cur_connection").text() = cur;**/
});

/*THIS RENDERS THE NAV*/
var nav = fs.readFileSync( __dirname + '/_nav.ejs', 'utf-8');
var rendered = ejs.render(nav);
$('nav').html(rendered)


/*THIS RENDERS THE MAIN*/
var internet = fs.readFileSync( __dirname + '/_index.ejs', 'utf-8');
var rendered = ejs.render(internet, {output : list_connections()});
$('main').html(rendered)
/*Used to trigger the modal located in _index.ejs*/
$('.modal-trigger').leanModal({
     dismissible: true, // Modal can be dismissed by clicking outside of the modal
     opacity: .5, // Opacity of modal background
     in_duration: 300, // Transition in duration
     out_duration: 200, // Transition out duration
   }
 );
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
