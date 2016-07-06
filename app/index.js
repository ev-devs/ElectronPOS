var util = require('util')
var execSync = require('child_process').execSync
var spawnSync = require('child_process').spawnSync
var internet = require('./lib/internet.js')

var fs = require('fs');
var ejs = require('ejs');


/*THIS RENDERS THE NAV*/
$('nav').html(ejs.render(fs.readFileSync( __dirname + '/views/internet/_beginning_nav.html', 'utf-8'), {
    /*any JSON object can go here*/
}));

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

/*WE LAUNCH OUR SERVER TO START SESSIONS*/
require('./lib/server.js')
