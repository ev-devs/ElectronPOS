

var util = require('util')
var execSync = require('child_process').execSync
var spawnSync = require('child_process').spawnSync
var internet = require('../../lib/internet.js')
var events = require('../../lib/eventStart.js')

var fs = require('fs');
var ejs = require('ejs');



/*THIS RENDERS THE LIST OF INTERNET CONNECTIONS*/
$('main').html(ejs.render(fs.readFileSync( __dirname + '/partials/connectlist.html', 'utf-8') , {
    output : internet.list_connections(),
    anything: "goes here"
}))


// THIS WILL READ FROM THE SERVER AND STORE INTO THE DATABASE AND THEN
// MOVE INTO THE NEXT VIEW
$(document).on('click', '#proceed', function() {
  /*Inventory*/
  var inventory_dl = 0;
  inherit_inventory()
  .then(function(result) {
    inventory = result;
    if(inventory.length != 0)
      window.location.assign("../02-eventstart/index.html");
  })
  .catch(function(result) {
      console.log(result);
  });
});
