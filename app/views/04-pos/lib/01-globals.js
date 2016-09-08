/***********************GLOBALS.JS***********************/
var request         = require('request');
var mongoose        = require('mongoose');
var ejs             = require('ejs');
var fs              = require('fs');
var accounting      = require('accounting-js');
var mongoose        = require('mongoose');
var _               = require("underscore");
var transaction     = require('../../lib/create_transaction.js');
var HashTable       = require('hashtable');
var fs              = require('fs')
var exec            = require('child_process').exec
/*used to communicate with main process*/
const ipc = require('electron').ipcRenderer
// Global variables
var inventory = [];
var inventory_query = [];
var URL = process.env.EQ_URL;
var deviceID = process.env.EQ_DEVICE_ID;
var leaders_list = []; // list of leaders pulled from the server
var user_input = ""; // user_input for platinums search
var searched_leaders = []; //modified array of searched leaders
var list_names = [];
var a_list = [];
var cur_transaction = {};
var ticket_table = new HashTable();
var event_info;
var tax_rate;
var cashier;
ipc.send('event-retrieval', "retrieving event info"); //sends a message to the main process which then responds with event info
ipc.send('cashier-retrieval', "retrieving event info");//sends a message to the main process which then responds with session info
ipc.on("event-retrieval-reply", function(event, arg) {//assigns the response to two global variables
  event_info = arg;
  tax_rate = event_info.meeting[0].taxrate;
});
ipc.on("cashier-retrieval-reply", function(event, arg) { //Assigns the response to a global variable
  cashier = arg;
});

/***********THIS IS OUR LOGIC**********************/
var PlatinumConnection = mongoose.createConnection('mongodb://localhost/platinums', function(err){ //Connects to the local platinum data base
    if (err){
        console.log(err)
    }
    else {
        console.log('we are connected to mongodb://localhost/platinums')
    }
});

var InventoryConnection = mongoose.createConnection('mongodb://localhost/inventory', function(err){ //connects to the local inventory database
    if (err){
        console.log(err)
        //Materialize.toast('Error connecting to Inventory MongoDB. Please startup mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/inventory')
    }
});

var TransactionConnection = mongoose.createConnection('mongodb://localhost/transactions', function(err){ //connects to the local transaction database
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
var Transaction = require('../../lib/transactions.js');     /*This will be used to store our transactions*/

/*********************************************NOTE: BEGIN SCAN VARIABLES*********************************************/
var item_list = []; //Item_list is the list of items the cusotmer has
/*Next 3 variables are self-explanatory. Just look at their name.*/
var subtotal = 0.00;
var tax = 0.00;
var total = 0.00;

var item_id = "NONE"; //Holds the id of the current item (id attribute assigned in the <tr> tage below). Is changed in one of the below functions
var item_num = 0;
var current_platinum = "NONE"; //Holds the current platinum
var current_ticket = [-1, -1, "CODE"]; //Holds the place of the current ticket in inventory and item_list as well as the code
var previous_ticket = 0; //Holds the code of the previous tickets
/*********************************************NOTE: BEGIN CONFIRM ORDER VARIABLES*********************************************/
var confirm_flag = 0;//Flag which denotes that the user can confirm at any time assuming the flag is raised. By default it is raised.
var card_flag = 0;//Flag which denotes the status of a transaction. If it is raised then a card transaction is being done.
var cash_flag = 0; //Flag which denotes the status of a transaction. If it is raised then a cash transaction is being done.
var cancel_flag = 0; //Flag which denotes that the user can cancel at any time assuming the flag is raised..
var previous_flag = 0; //Flag which denotes that the user can go to the previous page at any time assuming the flag is raised.
var scan_flag = 0;//Flag which denotes that the user can scan at any time assuming the flag is raised.
var ticket_flag = 0;//Flag which denotes that the user is handling a ticket transaction
var swipe_flag = 0;//Flag which denotes if a swipe can happen
var card_amt = 1; //Stores the
var previous_page = "1";//Stores the previous page
var current_page = "2";//Stores the current page
var can_end_session = 1;//Denotes if a session can be ended

var credit_card_can_be_charged = false;//denotes if a card can be charged

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
$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 1})); //renders the neccessary partial on window assignment
update_transaction_db();
