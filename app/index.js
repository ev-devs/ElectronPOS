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

/*Simply grabs the name of the access point which is stored in two ways, as the id and the text of the <a> tag*/
$(document).on('click', '.wifi_option', function() {
  ap_name = $(this).attr('id');
});

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
  }
  else {
	console.log("disconnected");  
   }
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
