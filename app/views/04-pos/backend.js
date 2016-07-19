/*

tl;dr This contains all the logic for the pos.html view

file name   : pos.js
full path   : app/views/pos/pos.js
purpose     : manipulate the POS GUI when scanning items
              as well as communication with the EMV reader (to charge client)
present in  : pos.html

*/
var request = require('request');
//TO be removed once connected to views
var ejs = require('ejs');
var fs = require('fs');
var accounting = require('accounting-js');
var _ = require("underscore");
// Global variables
var inventory = [];
var URL = process.env.EQ_URL.toString();
var leaders_list = [];
var list_names = [];


$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 1}));

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
  		// console.log(body);
  		if (!error && response.statusCode == 200) {
  			var resp = JSON.parse(body);

  			var ordItems = _.sortBy(resp.items, function (item) {
  				return item.title;
  			})
  			//console.log(ordItems);
				inventory = ordItems;
  		} else if (error) {
  			console.log(error);
  		} else {
  			//console.log(body);
  		}
  	});

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
		name = list[i].lastname.toString()  + ", " + list[i].firstname.toString();
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

//function selectPlatinum(list){
//var user_input = "";
$(document).on("change", "#enter-platinum", function(){
		var user_input = "";
		console.log("CHANGED PLATINUM");
		user_input = $("#enter-platinum").val();
		if(user_input != ""){
			list_names = [];
			var re = new RegExp(user_input.toString(), "i");
			for(var i = 0; i < leaders_list.length; i++){
				if(leaders_list[i].search(re) != -1){
					list_names.push(leaders_list[i]);
				}
			}
			console.log(list_names);
			display_list(list_names);
		}
	});
//}

function display_list(list){
	var name = "";
	$("#platinums-list").empty();
		for(var i = 0; i < list.length; i++){
		  var id_name = list[i].toString().replace(/ /g, "1").replace(/,/g, "2");
			name = "<a href=\"#!\" class=\"collection-item platinum\" id=\"" + id_name + "\">" + list[i].toString() + "</a>";
			$("#platinums-list").append(name);
	}
}

$(document).on("click", ".platinum", function() {
  if(current_platinum != "NONE") {
    $("#" + current_platinum).removeClass("green");
  }
	confirm_flag = 1;
  current_platinum = $(this).attr("id");
  $("#" + current_platinum).addClass("green lighten-3");
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {}));
	$("#current-platinum").attr("placeholder", "Platinum: " + current_platinum.replace(/1/g, " ").replace(/2/g, ","));
});

/*This function merely searches the inventory by barcode to see if it exists. If so then see if the item is already
in the customers list. If so the increment the counter and if not then add to list.
@return: index of the item in the item_list
@param: item_list, inventory, and barcode*/
function determine_item_status(item_list, inventory, barcode) {
  var i = -1;
  /*Check the inventory by bar code(which as we wrote right now has two entries) and store the result*/
  var inv_result = inventory.find(function(e) {
    return e.barcode == barcode;
  });

  /*If it's in the inventory go here*/
  if(inv_result != undefined) {
    /*Check the customers current list to see if they already have it in their choices*/
    //console.log("In inventory");
    var flag = 0;
    cus_result = item_list.find(function(e) {
      /*This i will keep track of where it is in the list*/
      i++;
      return e.barcode == barcode;
    });
    /*If the customer already has one then just increment the quantity counter*/
    if(cus_result != undefined) {
      item_list[i].cust_quantity+=1;
    }
    /*If not then increment the counter to one and add to the customer's list called item_list*/
    else {
      inv_result['cust_quantity'] = 1;
      item_list.push(inv_result);
      i = item_list.length - 1;
    }
    /*return the place of the item in the list for future use*/
    return i;
  }
  else {
    return -1;
  }
};

/*BEGIN DELETE CODE*/
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

$("#y_cancel").click(function() {
	/*As long as the length of the list is > 0 then cancellations can happen*/
  if(item_list.length != 0) {
		/*Voids the order*/
    void_order();
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		/*Fades out the "thanks" element from the compelte.html file*/
    setTimeout(fade_out, 1500);
		/*Sets the confirm flag to 1 denoting an order CAN be confirmed*/
    confirm_flag = 1;
		/*Sets the card flag to 0 denoting a cancelled transaction*/
    cash_flag = 0;
		/*Sets the card flag to 0 denoting a cancelled transaction*/
    card_flag = 0;
		/*Refocus the page on the barcode input*/
    refocus();
  }
});

/*NOTE: BEGIN CONFIRM ORDER CODE*/
/*Flag which denotes that the user can confirm at any time assuming the flag is raised. By default it is raised.*/
var confirm_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a card transaction is being done.*/
var card_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a cash transaction is being done.*/
var cash_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a cash and card transaction is being done.*/
var cash_card_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a multi card transaction is being done.*/
var multi_card_flag = 0;
/*Flag which denotes that the user can cancel at any time assuming the flag is raised. By default it is raised.*/
var cancel_flag = 0;


$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1) {
		/*If the length of the list of item is 0 (empty list) then there is nothing to confirm. Otherwise render the pay options.*/
    if(item_list.length != 0) {
			/*If we aren't in the middle of a transaction and can confirm normally then render the options*/
      if(confirm_flag == 1) {
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
				/*Set the confirm flag to 0 to denote that we are in the middle of a transaction*/
        confirm_flag = 0;
      }
    }
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
  if(cash_flag || cash_card_flag) {
		/*Renders the html file necessary to denote the transaction is complete*/
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
  }
});

/*Renders the necessary partial for completing orders with cash.*/
$(document).on("click", "#cash", function () {
	/*Sets the cash flag to true to denote a cash transaction is in process*/
  cash_flag = 1;
	/*Renders the html file necessary to handle cash transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
});

/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	/*Renders the html file necessary to handle card transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
});

/*Renders the necessary partial for completing orders with cash and cards*/
$(document).on("click", "#c_and_c", function () {
  cash_card_flag = 1;
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
  console.log("Cash and card");
});

/*Renders the necessary partial for completing orders with multiple cards.*/
$(document).on("click", "#m_card", function () {
  console.log("Multi card");
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_amt.html', 'utf-8') , {}));
});

/*NOTE: BEGIN CARD TRANSACTION CODE*/
$(document).on("click", "#swipe_sim", function() {
	/*Set the cancel flag to prevent any cancellations once the card is in the processing stages*/
  cancel_flag = 0;
	/*Only allows the swipe button to render the process.html file if the card option is the selected pay option*/
  if(card_flag || cash_card_flag) {
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , {}));
    setTimeout(function() {
      if(card_flag)
  		  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
      else if(cash_card_flag)
    		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
    }, 3000);
  }
});


/*A function that voids an order. Used to cancel orders and void orders aftercash or card has been paid*/
function void_order() {
    item_list.splice(0, item_list.length);/*Empties the item list*/
		/*Empties the left side*/
    $("#sale_list tbody").empty();
		/*Empties the subtotal and total*/
    subtotal = 0;
    tax = 0;
    total = 0;
    $("#subtotal").text("$" + subtotal.toString());
    $("#tax").text("$"+tax.toString());
    $("#total").text("$"+total.toString());
    $("#cancel").removeAttr("style");
    $("#confirm").removeAttr("style");
    /*Sets the confirm flag back to one to denote that a normal completion can happen*/
    confirm_flag = 0;
    cancel_flag = 0;
    /*Cash flag is set to 0 to denote the end of a cash transaction*/
    cash_flag = 0;
    /**/
    card_flag = 0;
    multi_card_flag = 0;
    cash_card_flag = 0;
    current_platinum = "NONE";
    setTimeout(function() {
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
    }, 1500);
}
