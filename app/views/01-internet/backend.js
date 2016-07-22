

var util       = require('util') /*this is for our utility needs*/
var execSync   = require('child_process').execSync /*This is for our child process needs*/
var spawnSync  = require('child_process').spawnSync

var internet   = require('../../lib/internet.js') /* This executes our bash scripts*/
var events     = require('../../lib/eventstart.js') /* not sure what the fuck this is but its here so fuck it  */

var fs  = require('fs');
var ejs = require('ejs');

var mongoose = require('mongoose');

var PlatinumConnection = mongoose.createConnection('mongodb://localhost/platinums', function(err){
    if (err){
        console.log(err)
    }
    else {
        console.log('we are connected to mongodb://localhost/platinums')
    }
});

var InventoryConnection = mongoose.createConnection('mongodb://localhost/inventory', function(err){
    if (err){
        console.log(err)
    }
    else {
        console.log('we are connected to mongodb://localhost/inventory')
    }
})

var Platinum = require('../../lib/platinum.js')     /*This will be used to store our platinums*/
var Inventory = require('../../lib/inventory.js')   /*This will be used to store our inventory*/

/*THIS RENDERS THE LIST OF INTERNET CONNECTIONS*/
$('main').html(ejs.render(fs.readFileSync( __dirname + '/partials/connectlist.html', 'utf-8') , {
    output      : internet.list_connections(),
    anything    : "goes here"
}))

// THIS WILL READ FROM THE SERVER AND STORE INTO THE DATABASE AND THEN
// MOVE INTO THE NEXT VIEW

$('#proceed').click(function(event){

    // this is us testing our connection. If either failes we need to choose
    // another wifi or estabish a faster connection

    pull_inventory()
    .then(function(inventory) {
      if(inventory.length != 0)
        console.log(inventory)
        console.log('Inventory has Been Pulled and stored')
        //window.location.assign("../02-eventstart/index.html");
    })
    .catch(function(result) {
        console.log(result);
    });


    pull_platinums()
    .then(function(platinuns){
        if (platinuns.lenght != 0){

            console.log(platinums)
            // store inventory here
            console.log('Platinuns have Been Pulled and stored')
        }
    })
    .catch(function(result) {
        console.log(result);
    });

});

/*
$(document).on('click', '#proceed', function() {

  var inventory_dl = 0;

});
*/
