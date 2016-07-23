/********THIS IS OUR REQUIREMENTS THAT WE NEED TO EXECUTS OUR FILES *********/
var util       = require('util') /*this is for our utility needs*/
var execSync   = require('child_process').execSync /*This is for our child process needs*/
var spawnSync  = require('child_process').spawnSync

var internet   = require('../../lib/internet.js') /* This executes our bash scripts*/
var events     = require('../../lib/eventstart.js') /* not sure what the fuck this is but its here so fuck it  */

var fs  = require('fs');
var ejs = require('ejs');


var URL = process.env.EQ_URL
var request = require('request');
var _ = require("underscore");

var mongoose = require('mongoose');

/***********THIS IS OUR LOGIC**********************/
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



$(document).on('click', '#proceed', function() {

  // var inventory_dl = 0;

  $('main').hide()

  $('#test_connection').show()

  // this is us testing our connection. If either failes we need to choose
  // another wifi or estabish a faster connection

  pull_inventory()
  .then(function(inventory) {
    if(inventory.length != 0)
      //console.log(inventory)
      console.log('Inventory has Been Pulled and stored')
      //window.location.assign("../02-eventstart/index.html");
  })
  .catch(function(result) {
      console.log("THERE WAS AN ERROR WITH INVENTORY PULLING " + result);
  });


  pull_platinums()
  .then(function(platinuns){
      if (platinuns.lenght != 0){

          //console.log(platinums)
          // store inventory here
          console.log('Platinuns have Been Pulled and stored')
      }
  })
  .catch(function(result) {
      console.log("THERE WAS AN ERROR WITH PLATINUM PULLING " + result);
  });
});




function pull_platinums() {
  return new Promise(function(resolve, reject) {
    request({
      method: 'POST',
      uri: URL + '/evleaders',
      form: {
        token: process.env.EQ_TOKEN
      }
    }, function (error, response, body) {
      // console.log(body);
      if (!error && response.statusCode == 200) {

        leaders = JSON.parse(body).evleaders;
        //console.log("LEADERS ARE " + JSON.stringify(leaders))
        insertPlatinumsToDatabase(leaders)
        resolve(leaders);
      }
      else if (error) {
        reject(error);
      }
      else {
        console.log( "OTHER RESPONSE " + body);
      }
    });
  });
}

function pull_inventory() {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    request({
        method: 'POST',
        uri: URL + '/inventory',
        form: {
          token: process.env.EQ_TOKEN
        }
      },
      function (error, response, body) {
        // console.log(body);
        if (!error && response.statusCode == 200) {
          var resp = JSON.parse(body);
          x = [1,2,3]
          var ordItems = _.sortBy(resp.items, function (item) {
            return item.title;
          })
          //console.log('ORD ITEMS ARE ' + JSON.stringify(ordItems))
          insertInventoryToDatabase(ordItems)
          resolve(ordItems);
        }
        else if (error) {
          reject(error);
        }
        else {
          console.log("OTHER RESPONSE " + body);
        }
      });
  });
}

function insertPlatinumsToDatabase(leaders) {
    // this is gonna be tricky since every I/O of the database is ASYNC
    $('#test_connection').hide()
    $('#load_platinums').show()

    leaders.forEach(function(leader){
        console.log(leader)
    })
}
function insertInventoryToDatabase(inventory){

    $('#load_platinums').hide()
    $('#load_inventory').show()

    inventory.forEach(function(item){
        console.log(item)
    })

    console.log('we are done!')
}



/*This simulates a button click*/
//$( "#proceed" ).trigger( "click" );
