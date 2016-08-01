var request = require('request');
//TO be removed once connected to views
var ejs = require('ejs');
var fs = require('fs');
var accounting = require('accounting-js');
var mongoose = require('mongoose');
var _ = require("underscore");
// Global variables
var inventory = [];
var inventory_query = [];
var URL = process.env.EQ_URL.toString();
var leaders_list = [];
var list_names = [];

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
var currentTransaction = 0;

$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 1}));

var TransactionsConnection = mongoose.createConnection('mongodb://localhost/transactions', function(err){
    if (err){
        console.log(err)
        Materialize.toast('Error connecting to transactions MongoDB. Please start up mongod', 1000000000000, 'rounded')
    }
    else {
        console.log('we are connected to mongodb://localhost/transactions')

    }
});

var Transactions = require('../../lib/transactions.js')   /*This will be used to store our inventory*/

request({
	method: 'POST',
	uri: URL + '/evleaders',
  form: {
    token: process.env.EQ_TOKEN.toString()
  }
	}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var leaders = [];  // container for the leaders object
				leaders = JSON.parse(body).evleaders; // gets list of leaders and puts it in container called leaders
				alphabetize(leaders); // gets leaders in alphabetic order places the result in leaders_list
				/*selectPlatinum(leaders_list)*/
				$('#platinums-list').show()
				$('.loading').remove()
			} else if (error) {
				console.log(error);
			} else {
				console.log(body);
			}
});

/*Inventory*/
request({
		method: 'POST',
		uri: URL + '/inventory',
		form: {
			token: process.env.EQ_TOKEN.toString()
		}
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var resp = JSON.parse(body);

			var ordItems = _.sortBy(resp.items, function (item) {
				return item.title;
			})
			inventory = ordItems;
		} else if (error) {
			console.log(error);
		} else {
			//console.log(body);
		}
	});

function handleTransaction() {

}
function insertInventoryToDatabase(_type, price, transaction){
  new Promise(function(resolve, reject){
    if (err){
        console.log( "There was an error finding an item " + err)
    }
    else {
      new Inventory({
        /*  id          : item._id,
          barcode     : item.barcode,
          isTicket    : item.isTicket,
          prefix      : item.prefix,
          price       : item.price,
          title       : item.title, */
          _type          : _type
          price          : price
          transId        : transaction.transId
          message        : transaction.message
          authCode       : transaction.authCode

      }).save(function(err){
          if (err){
              console.log('Error in creating new transaction item')
              reject(err)
          }
          else {
              resolve(1)
              console.log('Successfully created new item!')
          }
      })
    }
  }).then(function(result){
      currentTransaction++
  })
}
