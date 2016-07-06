var util = require('util')
var execSync = require('child_process').execSync
var spawnSync = require('child_process').spawnSync
var internet = require('./lib/internet.js')

var fs = require('fs');
var ejs = require('ejs');

var ap_name = "";
var psk = "";


/*THIS RENDERS THE NAV*/
$('nav').html(ejs.render(fs.readFileSync( __dirname + '/views/internet/_beginning_nav.html', 'utf-8'), {
    /*any JSON object can go here*/
}));

/*THIS RENDERS THE MAIN*/
$('main').html(ejs.render(fs.readFileSync( __dirname + '/views/internet/internet.html', 'utf-8') , {
    output : internet.list_connections(),
    anything: "goes here"
}))




/*Creates the custom event from the transition between the internet connection for view transition*/
/*Grabs the string that displays the current connection which is generated from the script*/
var status = document.getElementById("cur_con").innerText.toString();
/*Creates the custom event and passes in the status of the internet*/
var connected = new CustomEvent('connected', { 'detail': status  });
/*Tells the html element with id "cur_con" to listen for the event named connected. If the connected event is registered
(from my understanding when "connected" is dispatched by the dispatch event function below). then carry out the anonymous callback function.
You can think of this as the section of code which defines what our event DOES after it is created and called.*/
document.getElementById("cur_con").addEventListener('connected', function(e) {
  /*If the status is not "Wi-Fi: none" then render the button which allows the user to proceed*/
  if(status != "Wi-Fi: none") {
    var proceed = "<a class=\"waves-effect waves-light btn\" id=\"proceed\"><i class=\"material-icons right\">done</i>Proceed</a>";
    var remove = "<a class=\"waves-effect waves-light btn red\" id=\"remove\"><i class=\"material-icons right\">delete</i>Remove connection</a>";
    $("#connection_holder").append(remove);
    $("#connection_holder").append(proceed);
  }
}, false);

/*Creates the custom event from the transition between events page and login page*/
var proper_event = new CustomEvent('proper_event');

/*Simply grabs the name of the access point which is stored in two ways, as the id and the text of the <a> tag*/
$(document).on('click', '.wifi_option', function() {
  ap_name = $(this).attr('id');
});

/*Upon accepting a Wi-Fi connection this funtion will run the script which handels connection. If the password is wrong then the connection will
not happen*/
$(document).on('click', '#accept', function() {
  psk = $("#keyboard").val()
  /*Connects to the specified and waits for two seconds. The 2 second wait is to ensure that a connection is made or not.*/
  console.log(ap_name + psk);
  /*execSync("sudo ../pw/wifi_con.sh " + ap_name + " " + psk + " && sleep 2");*/
  execSync( "sudo " + __dirname + "/../pw/wifi_con.sh " + ap_name + " " + psk);

  /*If no connection is made then after running the wifi_cur.sh script again the word "none" will appear*/
  //var cur = "Wi-Fi: " + execSync("sudo " + __dirname + "/../pw/wifi_cur.sh && sleep 2 && wpa_cli scan").toString();
  var status;
  execSync("sleep 2");
  var output_d = spawnSync('wpa_cli', ['scan']);
  console.log(output_d.stderr.length);
  if(output_d.stderr.length == 0) {
	   console.log("CONNECTED");
     var cur = execSync("sudo " + __dirname + "/../pw/wifi_cur.sh ");
     $("#cur_con").text("Wifi: " + cur);
  }
  else {
	   console.log("DISCONNECTED");
     $("#cur_con").text("Wi-Fi: none");
   }
});

/*Here is where our element is dispatched*/
document.getElementById("cur_con").dispatchEvent(connected);

/*When the proceed button is rendered if it is pressed render the next view
NOTE: readFileSync is causing a warning. Should be changed to readFile?*/
$(document).on('click', '#proceed', function() {
  $('main').html(ejs.render(fs.readFileSync( __dirname + '/events.html', 'utf-8') , {}));
});

/*When the remove connection button is pressed then remove the current connection*/
$(document).on('click', '#remove', function() {
  execSync("sudo " + __dirname + "/../pw/wifi_rem.sh ");
});
/*Used to trigger the modal located in _index.ejs*/
$('.modal-trigger').leanModal({
     dismissible: true, // Modal can be dismissed by clicking outside of the modal
     opacity: .5, // Opacity of modal background
     in_duration: 300, // Transition in duration
     out_duration: 200, // Transition out duration
   }
 );
/*




/*WE LAUNCH OUR SERVER TO START SESSIONS*/
require('./lib/server.js')
