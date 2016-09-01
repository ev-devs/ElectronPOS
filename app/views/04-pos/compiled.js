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

$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 1})); //renders the neccessary partial on window assignment

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

/***********************PLATINUMS.JS***********************/
/*Leaders*/
//Lists leaders in alphabetical order
// appends html element to display all the names
// if search is changed, takes search input and reduces html elements to display elements with
// the searched word.
// if searched word is not found, displays no results notification
// if search is empty,

function alphabetize(list){
	var name = "";
	for(var i = 0; i < list.length; i++){
		name = list[i].firstname + " " +  list[i].lastname;
		leaders_list.push(name);
	}
	leaders_list.sort();
}

//take user input .change(function(){})   DONE
//convert to string .val()     DONE
//convert string into regex    var re = new RegExp("a|b", "i");
//search for regex in each element of the array array[i].search(regex)
//if regex is found, NOT -1, then get the index
// change to list to show in the browser

/*
var criteria = function(item, check) {
	if(check!= ""){
		if(item.search(check) != -1){
			return true
		}
	}
	else
		return false;
};

var leader = function(leader) {
	var name = new RegExp($("#enter-platinum").val(), "i");
	return criteria(leader, name);
};
*/


function search_list(list, input){
	var searched = [];
	var Reg_input = new RegExp(input, "i")
	for(i = 0; i < list.length; i++){
		if(list[i].search(Reg_input) != -1){
			searched.push(list[i]);
		} 
	}
	console.log(searched)
	return searched
}

$(document).on( "jpress", "#enter-platinum" , function(event, key){
   if(key != "shift" && key != "enter" && key != "123" && key != "ABC") {
		if(key == "delete"){
			user_input = user_input.substring(0,user_input.length - 1) 
		}
		else{
			var k = key
			if(k == "?" || k =="#" || k == "@" || k == "/" || k == "\\" || k == "<" || 
				k == ">" || k == "." || k == "," || k == "\"" || k == "\'" || k == "{" ||
				k == "}" || k == "[" || k == "]" || k == "$" || k == "%" || k == "^" || 
				 k == "*" || k == "(" || k == ")" || k == "`" || k == "~" || k == "+" ||
				 k == "-" || k == "=" || k == "_" || k == "|" || k == "1" || k == "2" ||
				 k == "3" || k == "4" || k == "5" ||k == "6" || k == "7" || k == "8" ||
				 k == "9" || k == "0" || k == ";"){
				Materialize.toast("Please Enter a Valid Character", 1000)
				k = " "
			}
			if(k == "space"){
				k = " "
			}
			user_input = user_input + k
		}
		if(user_input != ""){
			console.log(user_input)
			searched_leaders = search_list(leaders_list, user_input)
			display_list(searched_leaders);
		}
		else if(user_input == ""){
			$("#platinums-list").empty();
		}
	}
});

//Displays the list of leaders

function display_list(list){
	var name = "";
	$("#platinums-list").empty();
	for(var i = 0; i < list.length; i++){
	  var id_name = list[i].replace(/ /g, "1").replace(/,/g, "2");
		name = "<a href=\"#!\" class=\"collection-item platinum\" id=\"" + id_name + "\">" + list[i] + "</a>";
		$("#platinums-list").append(name);
	}
}

 
$(document).on("click", ".platinum", function() {
  if(current_platinum != "NONE") {
    $("#" + current_platinum).removeClass("green");
  }
	confirm_flag = 1;
	scan_flag = 1;
  current_platinum = $(this).attr("id");
  $("#" + current_platinum).addClass("green lighten-3");
	refocus();
	can_end_session = 0;
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
});

$("#platinum").click(function() {
	if(current_platinum != "NONE" && confirm_flag == 1) {
		current_platinum = "NONE";
		confirm_flag = 0;
		user_input = ""
		$('#enter-platinum').remove()
		$('#enter-platinum-modal').remove()
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
	}
})

/***********************CANCEL.JS***********************/
$("#cancel").click(function() {

  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1 && $(this).css('background-color') != 'rgb(255, 0, 0)') {
    $('#modal2').openModal();
    console.log("CANCEL");
	}
  else if(previous_flag || $(this).css('background-color') == 'rgb(255, 0, 0)') {
    console.log("PREVIOUS");
		if(current_page == "pay_choice.html") {
			console.log("1");
			confirm_flag = 1;
			scan_flag = 1;
			previous_flag = 0;
			current_page = "handle_order.html";
			previous_page = "handle_order.html";
      refocus();
			$("#cancel").removeAttr("style");
      $("#cancel").text("Cancel");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		else if(current_page == "card_amt.html") {
      console.log("2");
			current_page = "pay_choice.html";
			previous_page = "handle_order.html";
			card_flag = 0;
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
		else if(current_page == "cash.html") {
      console.log("3");
			current_page = "pay_choice.html"
			previous_page = "handle_order.html"
			cash_flag = 0;
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
		else if(current_page == "card.html") {
      console.log("4");
			current_page = "card_amt.html"
			previous_page = "pay_choice.html"
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
    else if(current_page == "card_input.html") {
      console.log("5");
      current_page = "card.html";
      previous_page = "card_amt";
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
    }
    else if(current_page == "prev_trans.html") {
      console.log("6");
      current_page = "select_platinums.html";
      previous_page = "select_platinums.html";
      $('#enter-platinum-modal').remove();
      $("#cancel").removeAttr("style");
      $("#cancel").text("cancel");
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {"A" : 0}));
    }
    else if(current_page == "indv_trans.html") {
      console.log("7");
      current_page = "prev_trans.html";
      previous_page = "select_platinums.html";
      $("#confirm").text("confirm");
      $("#confirm").removeAttr("style");
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {transactions: ay}));
    }
	}
  else if($("#cancel").text() == "Clear") {
    console.log("We cleared");
    clearSignaturePad()
  }

	else if(current_platinum == "NONE"){
		error_platinum();
	}
});

$("#y_cancel").click(function() {
	/*As long as the length of the list is > 0 then cancellations can happen*/
  if(item_list.length != 0) {
		/*Voids the order*/
    void_order(1);
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		/*Fades out the "thanks" element from the compelte.html file*/
    setTimeout(fade_out, 1500);
		void_order(1);
		/*Refocus the page on the barcode input*/
    refocus();
  }
});

/***********************CARD.JS***********************/
/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "card_amt.html";
	colorfy();
	/*Renders the html file necessary to handle card transactions*/

	$('#tendered_card-modal').remove();
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_amt.html', 'utf-8') , {"total" : accounting.formatNumber(total, 2, ",")}));
});


$(document).on("click", "#swipe_sim", function() {
	/*Set the cancel flag to prevent any cancellations once the card is in the processing stages*/
  cancel_flag = 0;
	previous_flag = 0;
	/*Only allows the swipe button to render the process.html file if the card option is the selected pay option*/
  if(card_flag && swipe_flag) {
		//card_call_to_auth();
		$("#cancel").removeAttr("style");
		$("#confirm").removeAttr("style");
		confirm_flag = 0;
		card_flag = 0;
		/*THIS CODE CAN BE REWRITTEN IN A BETTER MANNER BUT RIGHT NOW THIS WILL DO*/
		cancel_flag = 0;
		previous_flag = 0;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , {}));
  }
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});

$(document).on("click", "#card-input", function() {
	current_page = "card_input.html";
	previous_page = "card.html";
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_input.html', 'utf-8') , {}));
});

function handle_card() {
	if(card_amt != 0) {
		current_page = "card.html";
		previous_page = "card_amt.html";
		card_amt = Number($("#tendered_card").val().replace(/,/g, ""));
		swipe_flag = 1;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
	}
}

/*
function start_transaction(cardInfo) {

	var newTrans = new transaction();
	newTrans.chargeCreditCard({
					cardnumber  : "4242424242424242",
					expdate     : "0220",
			if (!obj.error){
				console.log(obj.transMessage)
				console.log("Trasaction Id:", obj.transId)
				console.log("Authorization Code:", obj.transAuthCode)
				/*If all the money was on the card then go to the printing option
				card_trans(obj.transAuthCode, obj.transId, obj.transMessage);
			}
			else {
				console.log(obj.transMessage)
				console.log("Error Code:", obj.transErrorCode)
				console.log("Error Text:", obj.transErrorText)
			}
		});
}
*//*
var card_date;
function card_trans(transAuthCode, transId, transMessage) {
	cur_transaction.createCardTransaction(function(transaction){
		let CardTrans = {
			guid     : transaction.guid,
			amount   : card_amt,
			authCode : transAuthCode,
			transId  : transId,
			message  : transMessage,
			cardType : "Harambe",
			dateCreated : new Date(),
			voidable : true,
			voided   : false
		}
		transaction.cards.push(CardTrans);
		transaction.payments++;
	});

	if(card_amt == Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
		print_init();
	}
	else if(card_amt < Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
		card_flag = 0;
		confirm_flag = 0;
		update_price('~', card_amt, 0, 1)
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
		current_page = "pay_choice.html";
		previous_page = "handle_order.html";
		previous_flag = 1;
		$("#cancel").css("background-color", "red");
	}
}*/
/*
var card_date;
function card_trans(transAuthCode, transId, transMessage) {
	cur_transaction.createCardTransaction(function(transaction){
		let CardTrans = {
			guid     : transaction.guid,
			amount   : card_amt,
			authCode : transAuthCode,
			transId  : transId,
			message  : transMessage,
			cardType : "Harambe",
			dateCreated : new Date(),
			voidable : true,
			voided   : false
		}
		transaction.cards.push(CardTrans);
		transaction.payments++;
	});

	if(card_amt == Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
		//void_order(1);
		//$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		print_init();
	}
	else if(card_amt < Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
		card_flag = 0;
		confirm_flag = 0;
		update_price('~', card_amt, 0, 1)
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
		current_page = "pay_choice.html";
		previous_page = "handle_order.html";
		previous_flag = 1;
		$("#cancel"%B6010569719163353^11027541/89^25010004000060084713           ?;6010569719163353=25010004000060084713?).css("background-color", "red");
	}
}
*/
/*function card_call_to_auth() {
var newTrans = new transaction();
newTrans.chargeCreditCard({
		cardnumber  : "4242424242424242",
		expdate     : "0220",
		ccv         : "123",
		amount      : card_amt.toString()
	}).then(function(obj){
		if (!obj.error){
			console.log(obj.transMessage)
			console.log("Trasaction Id:", obj.transId)
			console.log("Authorization Code:", obj.transAuthCode)
			/*If all the money was on the card then go to the printing option
			card_trans(obj.transAuthCode, obj.transId, obj.transMessage);
		}
		else {
			console.log(obj.transMessage)
			console.log("Error Code:", obj.transErrorCode)
			console.log("Error Text:", obj.transErrorText)
		}
	});
}*/

/***********************CASH.JS***********************/
$("#yes-cash").click(function () {
	//void_order(1);
	//$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
	print_init();
});

/*Renders the necessary partial for completing orders with cash.*/
$(document).on("click", "#cash", function () {
	/*Sets the cash flag to true to denote a cash transaction is in process*/
  cash_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "cash.html"
	colorfy();
	$('#tendered-modal').remove()
	/*Renders the html file necessary to handle cash transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
});

function handle_cash() {
	/*Updates the cur_transaction JSON object with the proper information for the transaction*/
	cash_trans();
	/*Renders the html file necessary to denote the transaction is complete*/
	if(Number($("#tendered").val().replace(/,/g, "")) >= accounting.formatNumber(total, 2, ",").replace(/,/g, "")) {
		$('#modal6').openModal({
			dismissible: true, // Modal can be dismissed by clicking outside of the modal
			opacity: .5, // Opacity of modal background
			in_duration: 300, // Transition in duration
			out_duration: 200, // Transition out duration
		});
	}
	else {
		update_price('~', Number($("#tendered").val().replace(/,/g, "")), 0, 1)
		cash_flag = 0;
		confirm_flag = 0;
		$("#cancel").removeAttr("style");
		$("#confirm").removeAttr("style");
		current_page = "pay_choice.html";
		previous_page = "handle_order.html";
		$("#cancel").css("background-color", "red");
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
	}
}

function cash_trans(){
	cur_transaction.createCashTransaction(function(transaction){

			let CashTrans = {
				guid 			: transaction.guid,
				tendered  : Number($("#tendered").val().replace(/,/g, "")),
				change 		: Number($("#change").text().substring(1, $("#change").text().length)),
				dateCreated : new Date()
			}
			transaction.cashes.push(CashTrans);
			transaction.payments++;
	});
}

/***********************CONFIRM.JS***********************/
$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1 && $("#confirm").text() != "Void") {
		/*If the length of the list of item is 0 (empty list) then there is nothing to confirm. Otherwise render the pay options.*/
    if(item_list.length != 0) {
			/*If we aren't in the middle of a transaction and can confirm normally then render the options*/
      if(confirm_flag == 1) {
				/*Set the confirm flag to 0 to denote that we are in the middle of a transaction*/
        confirm_flag = 0;
				scan_flag = 0;
				previous_flag = 1;
				previous_page = "handle_order.html";
				current_page = "pay_choice.html";
				$("#cancel").css("background-color", "red");
				$("#cancel").text("Back");
				init_transaction();
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
      }
    }
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
  else if(cash_flag) {
		handle_cash();
  }
	else if(card_flag) {

		if(current_page != "card.html")
			handle_card();
	}
	else if($("#confirm").text() == "Accept") {
		acceptSignature()
	}
	else if($("#confirm").text() == "Void") {
		console.log("VOID");
		$('#voidModal3').openModal({
			dismissible: false, // Modal can be dismissed by clicking outside of the modal
			opacity: .5, // Opacity of modal background
			in_duration: 300, // Transition in duration
			out_duration: 200, // Transition out duration
		});
	}
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});

function init_transaction() {
	cur_transaction = new Transaction();
	cur_transaction.createGUID(); // this is where we assing the GUID. DO NOT CALL guid.create()
	cur_transaction.populateItems(function(transaction){

			transaction.platinum  = current_platinum.replace(/1/g, " ").replace(/2/g, ",");  //=> Here you should modify the platinum name
			transaction.dateCreated = new Date();     //=> Using the date.now() methd you should be fine
			transaction.subtotal = subtotal;   //=> this is the raw subtotal without taxes
			transaction.tax = tax;    //=> this can be calculated via a function with the data we get from the event
			transaction.total = total;      //=> this is just adding subtotal and tax together
			transaction.payments = 0;   //=> the amount of payments that will be made. At least 1
			transaction.city = event_info.meeting[0].city;
			transaction.state = event_info.meeting[0].state;
			transaction.zip = event_info.meeting[0].zip;
			transaction.cashier = cashier.firstname + " " + cashier.lastname;
			var date = Math.round(transaction.dateCreated.getTime()/1000);
			date = date.toString().substring(date.toString().length - 7, date.toString().length);
			transaction.receiptId = "2" + deviceID + date;
		for (var i = 0; i < item_list.length; i++){

				let item = {
					guid : cur_transaction.guid,
					evid 		: item_list[i].id,
					barcode 	: item_list[i].barcode,
					title		: item_list[i].title,
					isticket	: item_list[i].isticket,
					prefix		: item_list[i].prefix,
					price		: item_list[i].price,
					tax			: item_list[i].price * tax_rate,
					quantity : item_list[i].cust_quantity,
					cashier : cashier.lastname + ", "+ cashier.firstname
				}

				transaction.items.push(item);
			}
	});
}
/*console.log("card flag");
if(current_page == "card_input.html") {
	console.log("JUAN");
	if($("#first_name").val() != "" && $("#last_name").val() != "" && $("#m_exp").val() != "" && $("#y_exp").val() != "") {
	console.log("JUANA")
	var newTrans = new transaction();
	newTrans.chargeCreditCard({
					cardnumber  : "4242424242424242",
					expdate     : "0220",
					ccv         : "123",
					amount      : card_amt.toString()
		}).then(function(obj){
			if (!obj.error){
				console.log(obj.transMessage)
				console.log("Trasaction Id:", obj.transId)
				console.log("Authorization Code:", obj.transAuthCode)
				//card_trans(obj.transAuthCode, obj.transId, obj.transMessage);
				cur_transaction.createCardTransaction(function(transaction){
					let CardTrans = {
						guid     : transaction.guid,
						amount   : card_amt,
						authCode : obj.transAuthCode,
						transId  : obj.transId,
						message  : obj.transMessage,
						cardType : "Harambe",
						dateCreated : new Date(),
						voidable : true,
						voided   : false
					}
					transaction.cards.push(CardTrans);
					transaction.payments++;
				});

				if(card_amt == Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
					print_init();
				}
				else if(card_amt < Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
					card_flag = 0;
					confirm_flag = 0;
					update_price('~', card_amt, 0, 1)
					$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
					current_page = "pay_choice.html";
					previous_page = "handle_order.html";
					previous_flag = 1;
					$("#cancel").css("background-color", "red");
				}
			}
			else {
				console.log(obj.transMessage)
				console.log("Error Code:", obj.transErrorCode)
				console.log("Error Text:", obj.transErrorText)
			}
		})
	}
	*/

/***********************DELETE.JS***********************/
/*When a finger is on the screen and on an item record the start point.
This is how far away the finger is from the left border.*/
$(document).on("touchstart", ".whole-item", function(e) {
  var touchobj = e.originalEvent.changedTouches[0].clientX;
  touchstart = touchobj;
});

/*When the finger leaves the screen, record it's end point in pixels.*/
$(document).on("touchend", ".whole-item", function(e) {
  var touchobj = e.originalEvent.changedTouches[0].clientX;
  touchend = touchobj;
  /*Before seeing if this is a valid swipe take note of the item_id for future use*/
  item_id = $(this).attr("id");
  /*A valid swipe is if the pixel difference from the start to end is 100 pixels. If a valid swipe then bring up the delete confirm modal.*/
  if(touchstart-touchend >= 100) {
    /*Populates the modal with the item name for seller confirmation*/
    $(this).css("background-color", "red");
    /*Whole item taken from the html doc*/
    var item = $(this).find("span").text().trim();
    var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
    var item_name = item.substring(item.indexOf(": ") + 2, item.length);
    if(item_qnt == "1") {
      $('#item_type').text(item_name);
    }
    else {
      /*If there are multiple items to be deleted as how many  an create a form to input the amount*/
      $('#delete_option').html(
        ejs.render(
          fs.readFileSync( __dirname + '/partials/delete_form.html', 'utf-8') , {'max' : item_qnt}
        )
      );
      $('#item_type').text(" how many of " + item_name);
    }
    /*Open modal*/
    $('#modal1').openModal({
      dismissible: false, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
  }
});

/*Corresponds to a button on the modal. If this button is pressed then deleting is confirmed. All deleting is handled here.*/
$("#y_delete").click(function() {
  //var i = -1;
	/*Grab the item info by id and using the find function to find the element in the id*/
  var item = $("#" + item_id).find("span").text().trim();
	/*Gte the quantity of items*/
  var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
	/*Get the item name*/
  var item_name = item.substring(item.indexOf(": ") + 2, item.length);
	var i = find_in_customer_list("title", item_name)
	/*If the cust_quantity value is one*/
  if(item_list[i].cust_quantity == 1) {
		/*Do price updates*/
		update_price('-', 1, i, 0);
    item_list[i].cust_quantity = 0;
		/*Remove from gui and item_list*/
    $("#" + item_id).remove();
    item_list.splice(i, 1);
  }
	/*If the cust_quantity value is greater than one*/
  else if(item_list[i].cust_quantity > 1) {
		/*Gran the value to be deleted*/
    var delete_quantity = $("#delete-quantity").val();
    /*Do any pricing updates before deleting (can write into a function honestly)*/
		update_price('-', delete_quantity, i, 0);
		/*If the quantity of items to be deleted is less than than the current quantity*/
    if(delete_quantity < item_qnt) {
      item_list[i].cust_quantity-=delete_quantity;
			/*In the item info replace the old quantity with the new quantity*/
      item = item.replace(item_qnt.toString(), item_list[i].cust_quantity.toString());
			/*Take the title of the item and replace all the spaces with underscores because thats how the id is*/
      $("#" + $("#" + item_id).find("span").attr("id")).text(item);
    }
		/*If the quantity to delete matches the current quantity available*/
    else if(delete_quantity == item_qnt) {
			/*Make tthe cust_quantity value 0*/
      item_list[i].cust_quantity = 0;
			/*Removet hat item from the gui*/
      $("#" + item_id).remove();
			/*Remove that item from the item_list*/
      item_list.splice(i, 1);
    }
		/*Remove the form from the modal*/
		$("#delete-form").remove();
  }
	/*If the there aren't any items after deletion then there is nothing to cancel so lower the flag*/
	if(item_list.length == 0)
		cancel_flag = 0;
	/*Removes the red from the item*/
	$("#" + item_id).removeAttr("style");
	/*Refocuses the page on the barcode input*/
  refocus();
});

$("#n_delete").click(function() {
  /*Grab the item name*/
  var item = $("#" + item_id).find("span").text().trim();
	/*Grab the number of items*/
  var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
	/*If there are more than one items do this*/
  if(item_qnt >= "1") {
		/*Remove the form from the modal*/
    $("#delete-form").remove();
  }
	/*Removes the red from the item*/
	$("#" + item_id).removeAttr("style");
	/*Refocuses the page on the barcode input*/
  refocus();
});

/***********************DETECTCARDSWIPE.JS***********************/
/*
const HID = require('node-hid');
var devices = HID.devices() // this lists all the devices
var usbCardReader = null; // this is going to be our

console.log(devices)

for (device in devices) {

    if (devices[device].manufacturer == "Mag-Tek" && devices[device].product == 'USB Swipe Reader'){
        //console.log(devices[device].vendorId)
        usbCardReader = new HID.HID(  devices[device].path  );
        return
    }
}

usbCardReader.on("data", function(data) {
    console.log(data)
});
*/

/***********************ENDSESSION.JS***********************/

$('#end-session').click(function(event){

    if (can_end_session == 0){
      $('#modal9').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
      });
    }
    else {
        ipc.send('ibo-session-end', 'ending session now')
    }

})

// returns true if transaction is in progress
function transactionIsInProgress(){
    // chcek to see if the plane is completely empty
}

ipc.on('ibo-session-end-reply', function (event, arg) {
  const message = `Asynchronous message reply from main process: ${arg}`
  console.log(message)
  window.location.assign('../03-beginsession/index.html')
})

/***********************FRONTEND.JS***********************/
document.addEventListener('refocus', function(e) {
  $("#barcode").focus();
})

function refocus() {
  var event = new CustomEvent('refocus');
  document.dispatchEvent(event);
}


/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE */
$(document).on( "jpress", "#tendered", function() {
  if($(this).val() >= total) {
    var change = $(this).val() - accounting.formatNumber(total, 2, ",").replace(/,/g, "");
    $("#change").text("$" + accounting.formatNumber(change, 2, ","));
  }
  else
    $("#change").text(0);
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Render platinums list FIX*/
}


 $(".button-collapse").sideNav();

/***********************FUNCTIONS.JS***********************/
function update_price(operation, quantity, placement, confirmed) {
    if(!confirmed) {
        /*Update the global quantities of subtotal, tax, and total*/
        if(operation == '+')
            subtotal+=((item_list[placement].price * quantity));
        else if(operation == '-')
            subtotal-=((item_list[placement].price * quantity));
        else if(operation == '~')
            subtotal-=quantity;
        $("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",") );
        tax = subtotal * tax_rate;
        $("#tax").text("$" + accounting.formatNumber(tax, 2, ",") );
        total = subtotal + tax;
        $("#total").text("$" + accounting.formatNumber(total, 2, ",") );
    }
    else if(confirmed) {
        total-=quantity;
        $("#total").text("$" + accounting.formatNumber(total, 2, ",") );
    }
}

/*********************************************NOTE: BEGIN VOID ORDER CODE*********************************************/
/*A function that voids an order. Used to cancel orders and void orders aftercash or card has been paid*/
function void_order(full_void) {
    can_end_session = 1;
    confirm_flag = 0;
    cancel_flag = 0;
    /*Cash flag is set to 0 to denote the end of a cash transaction*/
    cash_flag = 0;
    /**/
    card_flag = 0;
    scan_flag = 0;
    ticket_flag = 0;
    swipe_flag = 0;
    current_ticket = [-1, -1, "CODE"];
    if(full_void == 1) {
      item_list.splice(0, item_list.length);/*Empties the item list*/
          /*Empties the left side*/
      $("#sale_list tbody").empty();
          /*Empties the subtotal and total*/
      update_price('~', subtotal, 0, 0);
      $("#cancel").removeAttr("style");
      $("#confirm").removeAttr("style");
      /*Sets the confirm flag back to one to denote that a normal completion can happen*/
      current_platinum = "NONE";
      previous_page = "1";
      current_page = "2";
      cur_transaction = {};
      setTimeout(function() {
          $('#enter-platinum').remove()
          $('#enter-platinum-modal').remove()
          $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
      }, 1500);
    }
}

function colorfy() {
    /*Sets the cancel and confirm buttons to red and green respectively*/
    $("#cancel").css("background-color", "red");
    $("#confirm").css("background-color", "green");
}

/*********************************************BEGIN ERROR MODAL CODE*********************************************/
function error_platinum() {
    $('#modal4').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
    });
}

function error_in_used() {
    $('#modal5').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
    });
}

/***********************INVENTORY.JS***********************/
/*var i_i = -1;

var inventory_item = function(item) {
	i_i++;
	if(item.barcode != null) {
		if((item.title.search(query) != -1) || (item.barcode.search(query) != -1)) {
			var item = Object.assign({}, item)
			inventory_query.push(item);
			item.title+=("-_" + i_i);
		}
	}
}
*/
var search_param = "";
$("#search").on( 'jpress', function(event , key){
		if(current_platinum != "NONE") {
			if (!(key == "enter" || key=="shift" || key == "123" || key == "ABC")){
				var query = $(this).val();
				if(scan_flag == 1) {
					query = new RegExp(query, "i");
					inventory_query.splice(0, inventory_query.length);
					$("#item_list").empty();
					var i = -1
				  inventory.find(function(e) {
						i++;
						if(e.barcode != null) {
							if((e.title.search(query) != -1) || (e.barcode.search(query) != -1)) {
								var item = [];
								item.push(e.title);
								item.push(e.price);
								item[0]+=("-_" + i);
								inventory_query.push(item);
							}
						}
					});
					$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/inventory.html', 'utf-8') , {"query_results" : inventory_query}));
				}
			}
		}
		else {
			error_platinum();
		}
});

$(document).on("click",  ".item", function() {
  $("#selected_item").text($($(this).children()[0]).text().trim());
  $("#selected_item").removeClass();
  $("#selected_item").addClass($($(this).children()[0]).attr("id"));
	search_param = Number($($(this).children()[0]).attr("id"))
	$('#modal3').openModal({
		dismissible: false, // Modal can be dismissed by clicking outside of the modal
		opacity: .5, // Opacity of modal background
		in_duration: 300, // Transition in duration
		out_duration: 200, // Transition out duration
	});
});

$(document).on("click",  "#confirm_item_selection", function() {
	var quantity = $("#selected_item_qnt").val();
	var barcode = inventory[search_param].barcode;
	if(quantity != 0 && quantity != "") {
		//var i = -1
		var i = find_in_customer_list("barcode", barcode)
			if(i != -1/*undefined*/) {
				item_list[i].cust_quantity+=Number(quantity);
				add_item(i, Number($("#selected_item").attr("class")), quantity, 0)
			}
			else {
				var item = inventory[Number($("#selected_item").attr("class"))]
				item['cust_quantity'] = Number(quantity);
				item_list.push(item);
				add_item(item_list.length - 1, Number($("#selected_item").attr("class")), quantity, 1);
				f = 1;
			}
		}
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
	refocus();
});

$(document).on("click",  "#cancel_item_selection", function() {
	refocus();
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
});

/***********************JBOARD.JS***********************/
function jboardify(id, type) {
    $('#' + id).jboard(type)
}



$('#search').jboard('standard')

//$('#barcode').jboard('standard')

//$('#enter-platinum').jboard('standard')

$('#search').on( 'jpress', function(event, key){
    console.log(key)
})

$('#barcode').on( 'jpress', function(event, key){
    console.log(key)
})

/***********************PRINT.JS***********************/
$(document).on("click", "#yes-receipt", function() {
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
  printTheOrder(cur_transaction.guid)
  void_order(1);
});

$(document).on("click", "#no-receipt", function() {
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
  void_order(1);
});

function print_init() {
  $("#cancel").removeAttr("style");
  $("#confirm").removeAttr("style");
  previous_flag = 0;
  confirm_flag = 0;
  cancel_flag = 0;
  cash_flag = 0;
  card_flag = 0;
  console.log("===============BEFORE:");
  console.log(cur_transaction);
  cur_transaction.save(function(err){
    if (err){
      console.log("Error in saving new transaction", err)
      Materialize.toast(err, 10000)
      console.log(cur_transaction)
    }
    else {
      console.log("New transaction saved!")
    }
  });
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/print.html', 'utf-8') , {}));
  console.log("===============AFTER:");
  console.log(cur_transaction);
}


// this is what will do the printing
function printTheOrder(guid){
    Transaction.findOne({guid : guid}, function(err, transaction){
        if (err){
            console.log(err)
            Materialize.toast(err, 10000)
        }
        else {
            /*we need to iterate through this*/
            let cashes      = transaction.cashes
            let cards       = transaction.cards
            let items       = transaction.items
            let stream = fs.createWriteStream( __dirname + '/../../../kprint/reciept.txt', {
                flags : 'w', encoding : 'utf-8'
            })
            stream.on('error', function(error){
                Materialize.toast(error, 10000)
            })

            /*This is the header*/
            stream.write( "date, "      + transaction.dateCreated   + '\n')
            stream.write( "guid, "      + transaction.guid          + '\n')

            /*This is the lower header*/
            stream.write( "city, "      + transaction.city      + '\n')
            stream.write( "state, "     + transaction.state     + '\n')
            stream.write( "recieptId, " + transaction.recieptId + '\n')

            stream.write( 'leader, '    + transaction.platinum      + '\n')

            /*This is the */
            stream.write( "subtotal, "  + transaction.subtotal      + '\n')
            stream.write( "tax, "       + transaction.tax           + '\n')
            stream.write( "total,"      + transaction.total         + '\n')
            stream.write( "payments, "  + transaction.payments      + '\n')
            stream.write('\n\n')


            stream.write('ItemsBegin\n')
            for (let i = 0; i < items.length; i++){
                stream.write(items[i].title + ',' + items[i].quantity + ',' + items[i].price + '\n')
            }
            stream.write('ItemsEnd\n\n')


            stream.write('BeginCashes\n')
            for (let j = 0; j < cashes.length; j++){
                stream.write(cashes[j].tendered + ','  + cashes[j].change + '\n')
            }
            stream.write('EndCashes\n\n')


            stream.write('BeginCards\n')
            for (let k = 0; k < cards.length; k++){
                stream.write(cards[k].cardType + ',' + cards[k].digits + ',' + cards[k].card_holder + ',' + cards[k].cardType + ',' + cards[k].authCode + ','  + cards[k].transId + '\n')
            }
            stream.write('EndCards\n\n')

            stream.end()

            exec('sudo python ' + __dirname + '/../../../kprint/print.py', function(error , stdout, stderr ){
                if (error){
                    Materialize.toast(error, 100000)
                    console.log(error)
                }
                console.log(stdout)
                console.log(stderr)
                Materialize.toast(stdout, 10000)
                Materialize.toast(stderr, 10000)
            })
        }
    })
}

/***********************SCAN.JS***********************/

$("#barcode").change(function() {
  /*Grab the barcode from the text area about*/
  var barcode = $("#barcode").val();
  /*Pass into  this function, which is defined below. See the function to know what it does.*/
  /*BRANCH which handles ticket transactions*/
	var k = -1;
	if(barcode[0] == '2' && barcode.length != 1 && current_platinum != "NONE") {
		k = verify_ticket(barcode);
	}
	if(k != -1 && current_platinum != "NONE" && ticket_table.get(barcode) == undefined) {
    handle_tickets(barcode);
	}
	else if(ticket_table.get(barcode) != undefined) {
		ticket_flag = 0;
		error_in_used();
	}
	else if(k == -1 && ticket_flag == 1 && current_platinum != "NONE") {
		$("#errors").text("Error! Please scan a ticket!");
	}
	/*END TICKET HANDLING CODE*/


	/*Handles transactions other than tickets*/
  else if(current_page == "prev_trans.html") {
    console.log("SEXY");
  }
	else if(k == -1 && current_platinum != "NONE"){
    console.log("X")
	  var i;
	  var places = [];
	  if(current_platinum != "NONE" && scan_flag == 1)
	    places = determine_item_status(item_list, inventory, barcode);
	  i = places[1]; //item_list_index
		j = places[0]; //inventory_list_index
	  /*If the item in the list has a quantity of one then this means it is not present on the gui and must be put into the gui
	  with the code below.*/
	  if(i != -1 && current_platinum != "NONE" && scan_flag == 1) {
			add_item(i, j, 1, 0);
		}
	  $("#barcode").focus();
	}
	else {
		error_platinum();
	}
  $("#barcode").val("");
});

/*Finds the specified item in the list, returns -1 if not found.*/
function find_in_customer_list(key, query) {
	var i = -1;
	console.log("QUERY: " + query);
	cus_result = item_list.find(function(e) {
		/*This i will keep track of where it is in the list*/
		i++;
		return e[key] == query;
	});
	if(cus_result == undefined)
		return -1;
	else
		return i;
}

/*This function merely searches the inventory by barcode to see if it exists. If so then see if the item is already
in the customers list. If so the increment the counter and if not then add to list.
@return: index of the item in the item_list
@param: item_list, inventory, and barcode*/
function determine_item_status(item_list, inventory, barcode) {
  var places = [-1, -1];
  /*Check the inventory by bar code(which as we wrote right now has two entries) and store the result*/
  var inv_result = inventory.find(function(e) {
		places[0] += 1;
    return e.barcode == barcode;
  });

  /*If it's in the inventory go here*/
  if(inv_result != undefined) {
    /*Check the customers current list to see if they already have it in their choices*/
    var flag = 0;
		places[1] = find_in_customer_list("barcode", barcode);
    /*If the customer already has one then just increment the quantity counter*/
    if(places[1] != -1) {
      item_list[places[1]].cust_quantity+=1;
    }
    /*If not then increment the counter to one and add to the customer's list called item_list*/
    else {
      inv_result['cust_quantity'] = 1;
      item_list.push(inv_result);
      places[1] = item_list.length - 1;
    }
    /*return the place of the item in the list for future use*/
    return places;
  }
  else {
    return -1;
  }
};

/*Adds items to the customers item list and does necessary updates, used twice within the code*/
function add_item(item_list_index, inventory_list_index, quantity, manual) {
	if(item_list[item_list_index].cust_quantity == 1 || manual == 1) {
		/*The item variable contains the html for the <tr> tag which displays our item in the gui. We give this tag an id of "itemx"
		where x represents where the item is in the "item_list" variable above. We then go to that place in the list and list out the key
		values as the text values of the td tags.*/
		var item = "<tr class=\"whole-item animated fadeIn\" id=\"item" + item_list_index + "\"> \
		 <td class=\"eq-cells name \" style=\"width: 77%;\"><span class=\"truncate\" id=\"inv-item" + inventory_list_index + "\">\
		 x" + item_list[item_list_index].cust_quantity + ": " + item_list[item_list_index].title + "</span></td> \
		 <td class=\"eq-cells price\" style=\"width: 23%; border-left: 1px solid #ddd;\">$" + item_list[item_list_index].price + "</td> \
		</tr>"
		/*Append to the table that holds the items*/
		$("#sale_list tbody").append(item);
	}
	/*If the item is in the list then just go to its place and increment its counter and update the gui*/
	else {
		var item = $("#inv-item" + inventory_list_index).text().trim();
		var qnt = item.substring(item.indexOf("x") + 1, item.indexOf(": "));
		item = item.replace(qnt.toString(), item_list[item_list_index].cust_quantity.toString());
		$("#inv-item" + inventory_list_index).text(item);
	}
	cancel_flag = 1;
	/*Update the global quantities of subtotal, tax, and total*/
	update_price('+', quantity, item_list_index, 0);
}

/***********************TICKET.JS***********************/
/*Function that verifies tif the current scanned item is a ticket. */
function verify_ticket(barcode) {
	var scan_prefix = barcode.substring(0, 6);
	scan_prefix = scan_prefix.substring(0, 1) + "0" + scan_prefix.substring(1, scan_prefix.length - 1);
	console.log(scan_prefix);
	var places = [];
	var i = -1;
	var ticket = inventory.find(function(e) {
		i++;
		if(e.barcode != null) {
			if(e.barcode.search(scan_prefix) != -1 && e.isticket == 1)
				return true;
		}
	})
	if(ticket == undefined)
		return -1;
	else if(ticket_flag != 1){
		current_ticket[0] = i;
		var title = inventory[i].title;
		var j = find_in_customer_list("title", title);
		console.log("J " + j);
		current_ticket[1] = j;
		current_ticket[2] = barcode.substring(6, barcode.length - 1);
	}
}
/*21610 1  027067   3*/
function add_to_table(start, quantity) {
	for(var i = 0; i < quantity; i++) {
		var tck_cnt = Number(start.substring(6, 12));
		tck_cnt+=i;
		if(start[6] == "0")
		tck_cnt = "0" + tck_cnt.toString();
		console.log(tck_cnt);
		ticket_table.put(start.replace(start.substring(6, 12), tck_cnt).toString(), true);
		console.log("A");
	}
	console.log("TABLE");
	console.log(ticket_table.keys());
}

function handle_tickets(barcode) {
	var ticket;
	if(ticket_flag == 0) {
			console.log("A");
			ticket_flag = 1;
			confirm_flag = 0;
			cancel_flag = 0;
			previous_ticket = barcode;
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/tickets.html', 'utf-8') , {}));
			refocus();
	}
	/*Add <= 50 functionality here*/
	else if(ticket_flag == 1) {
		console.log("B");
		var itm_qnt = Number(barcode.substring(6, barcode.length - 1)) - Number(current_ticket[2]) + 1;
		if(itm_qnt > 50) {
			$('#modal7').openModal({
				dismissible: false, // Modal can be dismissed by clicking outside of the modal
				opacity: .5, // Opacity of modal background
				in_duration: 300, // Transition in duration
				out_duration: 200, // Transition out duration
			});
		}
		else if(current_ticket[1] == -1) {
			//ticket = Object.assign({}, inventory[current_ticket[0]])
			ticket = inventory[current_ticket[0]];
			ticket.cust_quantity = (itm_qnt);
			/*ADD TO HASHTABLE*/
			item_list.push(ticket);
			current_ticket[1] = item_list.length - 1;
			add_item(current_ticket[1], current_ticket[0], ticket.cust_quantity, 1)
			add_to_table(previous_ticket, ticket.cust_quantity);
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		else if(current_ticket[1] != -1) {
			item_list[current_ticket[1]].cust_quantity+=(itm_qnt);
			add_item(current_ticket[1], current_ticket[0], item_list[current_ticket[1]].cust_quantity, 0)
			add_to_table(previous_ticket, itm_qnt);
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		ticket_flag = 0;
		confirm_flag = 1;
		cancel_flag = 1;
		refocus();
	}
}

var ay = [];
$("#prev-transactions").click(function() {
  if(can_end_session == 1) {
    current_platinum = "NON";
    confirm_flag = 1;
    current_page = "prev_trans.html";
    prev_page = "select_platinums.html";
    $("#cancel").css("background-color", "red");
    $("#cancel").text("Back");
    Transaction.find({}, function(err, _transactions) {
       var transactions = _transactions;
       update_transaction_db(_transactions);
       ay = transactions;
       $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/prev_trans.html', 'utf-8') , { transactions : transactions }));
    });
  }
  else {
    $('#modal8').openModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
  }
});


var elem_id;
$(document).on("click", ".transaction", function() {
   elem_id = $(this).attr("id");
   var i = Number(elem_id.substring(0, elem_id.search("_")));
   var j = Number(elem_id.substring(elem_id.search("_") + 1, elem_id.length));
   current_page = "indv_trans.html";
   prev_page = "prev_trans.html";
   var x = []
   x.push(ay[i]);
   x.push(j);
   $("#confirm").text("Void");
   $("#cancel").text("Back");
   $("#confirm").css("background-color", "green");
   $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/indv_trans.html', 'utf-8') , { transaction : x }));
});
/*
$('#voidModal3').openModal({
  dismissible: true, // Modal can be dismissed by clicking outside of the modal
  opacity: .5, // Opacity of modal background
  in_duration: 300, // Transition in duration
  out_duration: 200, // Transition out duration
});

*/
/*var trans_id = elem_id.substring(0, elem_id.search("_"));
var trans_guid = elem_id.substring(elem_id.search("_") + 1, elem_id.length)*/



$(document).on("click", "#confirm-void", function() {
  current_platinum = "NONE";
  confirm_flag = 0;
  var i = Number(elem_id.substring(0, elem_id.search("_")));
  var j = Number(elem_id.substring(elem_id.search("_") + 1, elem_id.length));
  //console.log(trans_guid);
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , { current: "Voiding" }));
  var newTrans = new transaction();
  newTrans.voidTransaction({
      transId  : ay[i].cards[j].transId
  }).then(function(obj){
    if (!obj.error) {
      console.log(obj.transMessage)
      console.log("Transaction Id:", obj.transId)
      $("#" + elem_id).remove();
      /*Begin transaction search*/
      Transaction.findOne( { guid : ay[i].guid }, function(err, trans){
        if (err){
            console.log( "Error in finding a transaction " +  err)
        }
        else {
          console.log(trans)
          trans.cards[j].voidable = false;
          trans.cards[j].voided = true;
          trans.save(function(err){
              if (err){
                  console.log("Error in updating Trans " + err)
              }
              else {
                  console.log("Updated Existing Trans")
                  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
              }
          })
        }
      });
        /*End Transaction search*/
    }
    else {
        console.log(obj.transMessage)
        console.log("Error Code:", obj.transErrorCode)
        console.log("Error Text:", obj.transErrorText)
    }
  });
});

function update_transaction_db(transactions_) {
  var cur_date = Date.parse(new Date());
  for(var i = 0; i < transactions_.length; i++) {
    for(var j = 0; j < transactions_[i].cards.length; j++) {
      var deadline = transactions_[i].cards[j].dateCreated;
      deadline = deadline.setDate(deadline.getDate() + 1);
      if(cur_date >= deadline) {
        /*Begin transaction search*/
        Transaction.findOne( { guid : transactions_[i].cards[j].guid }, function(err, trans){
          if (err){
              console.log( "Error in finding a transaction " +  err)
          }
          else {
            console.log(trans)
            trans.cards[0].voidable = false;
            trans.save(function(err){
                if (err){
                    console.log("Error in updating Trans " + err)
                }
                else {
                    console.log("Updated Existing Trans")
                }
            })
            console.log("FOUND");
          }
        });
        /*End Transaction search*/
      }
    }
  }
}
