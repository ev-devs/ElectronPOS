var util = require('util')
var execSync = require('child_process').execSync
var internet = require('./lib/internet.js')

var fs = require('fs');
var ejs = require('ejs');

var ap_name = "";
var psk = "";


/*Simply grabs the name of the access point which is stored in two ways, as the id and the text of the <a> tag*/
$(document).on('click', '.wifi_option', function() {
  ap_name = $(this).attr('id');
});



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
$('nav').html(ejs.render(fs.readFileSync( __dirname + '/views/internet/_beginning_nav.html', 'utf-8')));

/*THIS RENDERS THE MAIN*/
$('main').html(ejs.render(fs.readFileSync( __dirname + '/views/internet/internet.html', 'utf-8') , {
    output : internet.list_connections(),
    anything: "goes here"
}))




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
var passport = require('passport');
var session = require('express-session');
var tkn_strtgy = require('passport-token-auth').Strategy;
var app = express();

app.use(session({
  cookie : {maxAge : 60000},
  store : sessionStore,
  secret: 'biticks',
  resave : true,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.get('/', function(req, res){
    res.send('hello world!');
    console.log('we in BROOO!');
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.listen(3000, function(){
    console.log('listening on port 3000');

});
