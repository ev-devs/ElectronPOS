/***********************GLOBALS.JS***********************/
var request = require('request');
var mongoose = require('mongoose');
var ejs = require('ejs');
var fs = require('fs');
var accounting = require('accounting-js');
var mongoose = require('mongoose');
var _ = require("underscore");
var transaction = require('../../lib/create_transaction.js');
var HashTable = require('hashtable');
var cardCapture = require('node-card-capture').cardCapture
var trackParser = require('trackparser')


// Global variables
var inventory = [];
var inventory_query = [];
var URL = process.env.EQ_URL
var leaders_list = [];
var list_names = [];
var a_list = [];
var cur_transaction = {};
var ticket_table = new HashTable();

/***********THIS IS OUR LOGIC**********************/
var PlatinumConnection = mongoose.createConnection('mongodb://localhost/platinums', function(err){
    if (err){
        console.log(err)
    //    Materialize.toast('Error connecting to Platinums MongoDB. Please start up mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/platinums')

    }
});

var InventoryConnection = mongoose.createConnection('mongodb://localhost/inventory', function(err){
    if (err){
        console.log(err)
        //Materialize.toast('Error connecting to Inventory MongoDB. Please startup mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/inventory')
    }
});

var TransactionConnection = mongoose.createConnection('mongodb://localhost/transactions', function(err){
    if (err){
        console.log(err)
        Materialize.toast('Error connecting to transactions MongoDB. Please start up mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/transactions')

    }
});

/*This needs to be declared after we connect to the databases*/
var Platinum = require('../../lib/platinum.js');             /*This will be used to store our platinums*/
var Inventory = require('../../lib/inventory.js');           /*This will be used to store our inventory*/
var Transaction = require('../../lib/transactions.js');     /*This will be used to store our inventory*/

/***FOR TESTING PURPOSES***/
function force_transaction() {
cur_transaction = new Transaction();
cur_transaction.createGUID();
cur_transaction.populateItems(function(transaction){
    // transaction.guid      //=> this is the guid DO NOT MODIFY AND DO NOT ASSIGN ANYTHING
    transaction.platinum  = "HARAMBE";  //=> Here you should modify the platinum name
    transaction.dateCreated = new Date();     //=> Using the date.now() methd you should be fine
    transaction.location = "Harambe's Heart, Ohio"  //=> this can be reached from the main.js process via ipc
    transaction.subtotal = 69   //=> this is the raw subtotal without taxes
    transaction.tax = 10    //=> this can be calculated via a function with the data we get from the event
    transaction.total = 420      //=> this is just adding subtotal and tax together
    transaction.payments = 0   //=> the amount of payments that will be made. At least 1


  for (var i = 0; i < 1; i++){

      let item = {
        guid : cur_transaction.guid,
        evid 		: 69,
        barcode 	: 69,
        title		: "TESTI",
        isticket	: false,
        prefix		: 69,
        price		: 12,
        tax			:1
      }
    }
});

var newTrans = new transaction();
newTrans.chargeCreditCard({
    cardnumber  : "4242424242424242",
    expdate     : "0220",
    ccv         : "123",
    amount      : 80000
  }).then(function(obj){
    if (!obj.error){
      console.log(obj.transMessage)
      console.log("Trasaction Id:", obj.transId)
      console.log("Authorization Code:", obj.transAuthCode)
      /*If all the money was on the card then go to the printing option*/
      card_trans(obj.transAuthCode, obj.transId, obj.transMessage);

      cur_transaction.save(function(err){
        if (err){
          console.log("Error in saving new transaction")
        }
        else {
          console.log("New transaction saved!")
        }
      });
    }
    else {
      console.log(obj.transMessage)
      console.log("Error Code:", obj.transErrorCode)
      console.log("Error Text:", obj.transErrorText)
    }
  });
}
/***FOR TESTING PURPOSES***/


/*********************************************NOTE: BEGIN SCAN VARIABLES*********************************************/
/*Item_list is the list of items the cusotmer has*/
var item_list = [];
/*Next 3 variables are self-explanatory. Just look at their name.*/
var subtotal = 0.00;
var tax = 0.00;
var total = 0.00;
/*Holds the id of the current item (id attribute assigned in the <tr> tage below). Is changed in one of the below functions*/
var item_id = "NONE";
var item_num = 0;
var current_platinum = "NONE";
var current_ticket = [-1, -1, "CODE"];
var previous_ticket = 0;
/*********************************************NOTE: BEGIN CONFIRM ORDER VARIABLES*********************************************/
/*Flag which denotes that the user can confirm at any time assuming the flag is raised. By default it is raised.*/
var confirm_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a card transaction is being done.*/
var card_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a cash transaction is being done.*/
var cash_flag = 0;
/*Flag which denotes that the user can cancel at any time assuming the flag is raised..*/
var cancel_flag = 0;
/*Flag which denotes that the user can go to the previous page at any time assuming the flag is raised.*/
var previous_flag = 0;
/*Flag which denotes that the user can scan at any time assuming the flag is raised.*/
var scan_flag = 0;
/*Flag which denotes that the user is handling a ticket transaction*/
var ticket_flag = 0;
var swipe_flag = 0;
var card_amt = 1;
var previous_page = "1";
var current_page = "2";
var can_end_session = 1;

var credit_card_can_be_charged = false;


$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 1}));

Platinum.find({}, function(err, leaders) {
  alphabetize(leaders); // gets leaders in alphabetic order places the result in leaders_list
  /*selectPlatinum(leaders_list)*/
  $('#platinums-list').show()
  $('.loading').remove()
});


Inventory.find({}, function(err, _inventory) {
 // gets leaders in alphabetic order places the result in leaders_list
  inventory = _inventory;
});
