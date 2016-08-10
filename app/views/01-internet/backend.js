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

$('main').html(ejs.render(fs.readFileSync( __dirname + '/partials/loader.html', 'utf-8') , {}));
/***********THIS IS OUR LOGIC**********************/
var PlatinumConnection = mongoose.createConnection('mongodb://localhost/platinums', function(err){
    if (err){
        console.log(err)
        Materialize.toast('Error connecting to Platinums MongoDB. Please start up mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/platinums')

    }
});

var InventoryConnection = mongoose.createConnection('mongodb://localhost/inventory', function(err){
    if (err){
        console.log(err)
        Materialize.toast('Error connecting to Inventory MongoDB. Please startup mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/inventory')
    }
});

var Platinum = require('../../lib/platinum.js')     /*This will be used to store our platinums*/
var Inventory = require('../../lib/inventory.js')   /*This will be used to store our inventory*/

var inventorySize = null;
var currentInventory = 0;

var platinumSize = null;
var currentPlatinum = 0;

var global_interval = 0;


/*THIS RENDERS THE LIST OF INTERNET CONNECTIONS*/

/*$('main').html(ejs.render(fs.readFileSync( __dirname + '/partials/connectlist.html', 'utf-8') , {
    output      : internet.list_connections_S(),
    anything    : "goes here"
})) */

internet.list_connections_A()

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


  })
  .catch(function(result) {

      $('#test_connection').hide()
      $('#load_platinums').hide()
      $('#load_inventory').hide()

      console.log("THERE WAS AN ERROR WITH INVENTORY PULLING " + result);

      $('#retry').show()
  });



  pull_platinums()
  .then(function(platinuns){


  })
  .catch(function(result) {
      console.log("THERE WAS AN ERROR WITH PLATINUM PULLING " + result);
  });



  finish_setup()
  .then(function(status){
      console.log('we are done')
  })
  .catch(function(status){
      console.log('THIS WILL NEVER BE REACHED')
  })


});

function finish_setup() {
    return new Promise(function(resolve, reject){
        global_interval = setInterval(function(){
            if (platinumSize === currentPlatinum && inventorySize === currentInventory){
                clearInterval(global_interval)
                window.location.assign('../02-eventstart/index.html')
            }
        }, 3000)
        resolve(1)
    })
}


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
        platinumSize = leaders.length
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
          inventorySize = ordItems.length
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

    leaders.forEach(function(platinum){

        new Promise(function(resolve, reject){

            Platinum.findOne( { id : platinum._id }, function(err, leader){
                if (err){
                    console.log( "Error in finding a platinum " +  err)
                }
                else {
                    if (leader){

                        //console.log("LEADER EXISTS! " + leader)
                        // we update the leader just in case
                        leader.id        = platinum._id;
                        leader.active    = platinum.active;
                        leader.admin     = platinum.admin;
                        leader.email     = platinum.email;
                        leader.firstname = platinum.firstname;
                        leader.lastname  = platinum.lastname;
                        leader.pnl       = platinum.pnl;
                        leader.rt        = platinum.rt;

                        leader.save(function(err){
                            if (err){
                                console.log("Error in updating platinum " + err)
                                reject(err)
                            }
                            else {
                                console.log("Updated Existing Leader!")
                                resolve(1)
                            }
                        })
                    }
                    else {
                        // create new leader
                        new Platinum({
                            id          : platinum._id,
                            active      : platinum.active,
                            admin       : platinum.admin,
                            email       : platinum.email,
                            firstname   : platinum.firstname,
                            ibonumber   : platinum.ibonumber,
                            lastname    : platinum.lastname,
                            pnl         : platinum.pnl,
                            rt          : platinum.rt


                        }).save(function(err, newleader){
                            if (err){
                                console.log("Error in creating new platinum  " + err)
                                reject(err)
                            }
                            else {
                                console.log("New Leader Created! " + newleader)
                                resolve(1)
                            }
                        })
                    }
                }
            })
        }).then(function(result){
            currentPlatinum++
        })

    })
}
function insertInventoryToDatabase(inventory){

    $('#load_platinums').hide()
    $('#load_inventory').show()

    inventory.forEach(function(item){


        new Promise(function(resolve, reject){

            Inventory.findOne({ id : item._id}, function(err, foundItem){
                if (err){
                    console.log( "There was an error finding an item " + err)
                }
                else {
                    if (foundItem){

                        foundItem.id        = item._id;
                        foundItem.barcode   = item.barcode;
                        foundItem.title     = item.title;
                        foundItem.isticket  = item.isticket;
                        foundItem.prefix    = item.prefix;
                        foundItem.price     = item.price;
                        foundItem.cust_quantity = 0;

                        foundItem.save(function(err){
                            if (err){
                                console.log('ERROR in updating existing item ' + err)
                                reject(err)
                            }
                            else {
                                resolve(1)
                                console.log('Updated existing item!');
                            }
                        })
                    }
                    else {
                        // create new item
                        new Inventory({
                            id          : item._id,
                            barcode     : item.barcode,
                            isTicket    : item.isTicket,
                            prefix      : item.prefix,
                            price       : item.price,
                            title       : item.title,

                        }).save(function(err){
                            if (err){
                                console.log('Error in creating new Inventory item')
                                reject(err)
                            }
                            else {
                                resolve(1)
                                console.log('Successfully created new item!')
                            }
                        })
                    }
                }
            })
        }).then(function(result){
            currentInventory++
        })

    })
}

$('#retry').click(function(event){

    var ping = execSync('ping -c 1 google.com') // this is a single ping
    console.log(ping)
    $( "#proceed" ).trigger( "click" );

});
