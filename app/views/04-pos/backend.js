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
var card_amt = 1;
var previous_page = "";

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



/*********************************************NOTE: BEGIN PLATINUM CODE*********************************************/
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

$(document).on("change", "#enter-platinum", function(){
		var user_input = "";
		user_input = $("#enter-platinum").val();
		if(user_input != ""){
			list_names = [];
			var re = new RegExp(user_input.toString(), "i");
			for(var i = 0; i < leaders_list.length; i++){
				if(leaders_list[i].search(re) != -1){
					list_names.push(leaders_list[i]);
				}
			}
			display_list(list_names);
		}
	});

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
	scan_flag = 1;
  current_platinum = $(this).attr("id");
  $("#" + current_platinum).addClass("green lighten-3");
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
	//$("#current-platinum").attr("placeholder", current_platinum.replace(/1/g, " ").replace(/2/g, ","));
});

$("#platinum").click(function() {
	if(current_platinum != "NONE") {
		current_platinum = "NONE";
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
	}
})



/*********************************************NOTE: BEGIN SCAN CODE*********************************************/
/*When the #scan_sim button is click carry out the following callback*/
$("#scan_sim").click(function()  {
  /*Grab the barcode from the text area about*/
  var barcode = $("#barcode").val();
  /*Pass into  this function, which is defined below. See the function to know what it does.*/
	var k = -1;
	if(barcode[0] == '2' && barcode.length != 1 && current_platinum != "NONE") {
		console.log("BEGIN EVERYTHING HERE");
		k = verify_ticket(barcode);
	}
	var ticket;



	/*BRANCH which handles ticket transactions*/
	if(k != -1 && current_platinum != "NONE" && previous_ticket != Number(barcode.substring(6, barcode.length - 1))) {
		if(ticket_flag == 0) {
				ticket_flag = 1;
				$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/tickets.html', 'utf-8') , {}));
		}
		/*Add <= 50 functionality here*/
		else if(ticket_flag == 1) {
			if(current_ticket[1] == -1) {
				console.log("WAS NOT FOUND IN LIST");
				ticket = Object.assign({}, inventory[current_ticket[0]])
				ticket['cust_quantity'] = (Number(barcode.substring(6, barcode.length - 1)) - Number(current_ticket[2]) + 1);
				item_list.push(ticket);
				current_ticket[1] = item_list.length - 1;
				add_item(current_ticket[1], current_ticket[0], ticket.cust_quantity, 1)
			}
			else if(current_ticket[1] != -1) {
				console.log("WAS FOUND IN LIST");
				item_list[current_ticket[1]].cust_quantity+=(Number(barcode.substring(6, barcode.length - 1)) - Number(current_ticket[2]) + 1);
				add_item(current_ticket[1], current_ticket[0], item_list[current_ticket[1]].cust_quantity, 0)
			}
			ticket_flag = 0;
			previous_ticket = Number(barcode.substring(6, barcode.length - 1));
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		console.log("Ticket flag: " + ticket_flag);
		console.log("Item list: ");
		console.log(item_list);
		console.log("Previous: " + previous_ticket)
	}
	else if(previous_ticket == Number(barcode.substring(6, barcode.length - 1))) {
		ticket_flag = 0;
		console.log("Already scanned");
	}
	else if(k == -1 && ticket_flag == 1 && current_platinum != "NONE") {
		$("#errors").text("Error! Please scan a ticket!");
	}
	/*END TICKET HANDLING CODE*/


	/*Handles transactions other than tickets*/
	else if(k == -1 && current_platinum != "NONE"){
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
/*********************************************NOTE: BEGIN TICKET TRANSACTION CODE*********************************************/
/*Function that verifies tif the current scanned item is a ticket. */
/*
216101--0270673
TICK-C--201610
216101 --> 201610
can only do 50 tickets*/
function verify_ticket(barcode) {
	var scan_prefix = barcode.substring(0, 6);
	scan_prefix = scan_prefix.substring(0, 1) + "0" + scan_prefix.substring(1, scan_prefix.length - 1);
	console.log(scan_prefix);
	var places = [];
	var i = -1;
	var ticket = inventory.find(function(e) {
		i++;
		if(e.barcode.search(scan_prefix) != -1 && e.isticket == 1)
			return true;
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



/**********************************************NOTE: BEGIN SEARCH INVENTORY CODE*********************************************/
var search_param = "";
$("#search").change(function(){
	if(current_platinum != "NONE") {
		var query = $(this).val();
		if(scan_flag == 1) {
			query = new RegExp(query, "i");
			var i = -1;
			inventory_query.splice(0, inventory_query.length);
			$("#item_list").empty();
		  inventory.find(function(e) {
				i++;
				if(e.barcode != null) {
					if((e.title.search(query) != -1) || (e.barcode.search(query) != -1)) {
						var item = Object.assign({}, e)
						inventory_query.push(item);
						item.title+=("-_" + i);
						console.log(item);
					}
				}
	    });
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/inventory.html', 'utf-8') , {"query_results" : inventory_query}));
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
});

$(document).on("click",  "#cancel_item_selection", function() {
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
});

/*********************************************NOTE: BEGIN DELETE CODE*********************************************/
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



/*********************************************NOTE: BEGIN CANCEL ORDER CODE*********************************************/
$("#cancel").click(function() {
  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1 && $(this).css('background-color') != 'rgb(255, 0, 0)')
    $('#modal2').openModal();
  else if(previous_flag) {
		if(previous_page == "pay_choice.html") {
			$("#cancel").removeAttr("style");
			$("#confirm").removeAttr("style");
			void_order(0);
			cancel_flag = 1;
		}
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + previous_page, 'utf-8') , {}));
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


/*********************************************NOTE: BEGIN CONFIRM ORDER CODE*********************************************/
$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1) {
		/*If the length of the list of item is 0 (empty list) then there is nothing to confirm. Otherwise render the pay options.*/
    if(item_list.length != 0) {
			/*If we aren't in the middle of a transaction and can confirm normally then render the options*/
      if(confirm_flag == 1) {
				/*Set the confirm flag to 0 to denote that we are in the middle of a transaction*/
        confirm_flag = 0;
				scan_flag = 0;
				previous_flag = 1;
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
      }
    }
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
  else if(cash_flag) {
		/*Renders the html file necessary to denote the transaction is complete*/
		if(Number($("#tendered").val().replace(/,/g, "")) >= accounting.formatNumber(total, 2, ",").replace(/,/g, "")) {
			void_order(1);
    	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		}
		else {
			update_price('~', Number($("#tendered").val().replace(/,/g, "")), 0, 1)
			cash_flag = 0;
			confirm_flag = 0;
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
		}
  }
	else if(card_flag) {
		if(card_amt != 0) {
			previous_page = "card_amt.html";
			card_amt = Number($("#tendered_card").val().replace(/,/g, ""));
			console.log(card_amt);
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
		}
	}
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});

/*Renders the necessary partial for completing orders with cash.*/
$(document).on("click", "#cash", function () {
	/*Sets the cash flag to true to denote a cash transaction is in process*/
  cash_flag = 1;
	previous_page = "pay_choice.html";
	colorfy();
	/*Renders the html file necessary to handle cash transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
});

/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	previous_page = "pay_choice.html";
	colorfy();
	/*Renders the html file necessary to handle card transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_amt.html', 'utf-8') , {"total" : accounting.formatNumber(total, 2, ",")}));
});



/*********************************************NOTE: BEGIN CARD TRANSACTION CODE*********************************************/
$(document).on("click", "#swipe_sim", function() {
	/*Set the cancel flag to prevent any cancellations once the card is in the processing stages*/
  cancel_flag = 0;
	previous_flag = 0;
	/*Only allows the swipe button to render the process.html file if the card option is the selected pay option*/
  if(card_flag) {
		$("#cancel").removeAttr("style");
		$("#confirm").removeAttr("style");
		confirm_flag = 0;
		card_flag = 0;
		/*THIS CODE CAN BE REWRITTEN IN A BETTER MANNER BUT RIGHT NOW THIS WILL DO*/
		cancel_flag = 0;
		previous_flag = 0;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , {}));
    setTimeout(function() {
			if(card_amt == accounting.formatNumber(total, 2, ",").replace(/,/g, "")) {
				void_order(1);
			  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
			}
			else if(card_amt < accounting.formatNumber(total, 2, ",")) {
				card_flag = 0;
				confirm_flag = 0;
				update_price('~', card_amt, 0, 1)
				$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
			}
    }, 3000);
  }
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});



/*********************************************NOTE: BEGIN UPDATE  PRICE CODE*********************************************/
function update_price(operation, quantity, placement, confirmed) {
	if(!confirmed) {
		/*Update the global quantities of subtotal, tax, and total*/
		if(operation == '+')
			subtotal+=((item_list[placement].price * quantity));
		else if(operation == '-')
			subtotal-=((item_list[placement].price * quantity));
		else if(operation == '~')
			subtotal-=quantity;
		$("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",").toString());
		tax = subtotal * .075;
		$("#tax").text("$" + accounting.formatNumber(tax, 2, ",").toString());
		total = subtotal + tax;
		$("#total").text("$" + accounting.formatNumber(total, 2, ",").toString());
	}
	else if(confirmed) {
		total-=quantity;
		$("#total").text("$" + accounting.formatNumber(total, 2, ",").toString());
	}
}


/*********************************************NOTE: BEGIN VOID ORDER CODE*********************************************/
/*A function that voids an order. Used to cancel orders and void orders aftercash or card has been paid*/
function void_order(full_void) {
	confirm_flag = 0;
	cancel_flag = 0;
	/*Cash flag is set to 0 to denote the end of a cash transaction*/
	cash_flag = 0;
	/**/
	card_flag = 0;
	scan_flag = 0;
	ticket_flag = 0;
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
    setTimeout(function() {
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
/*
Software to-do:
-Finish integrating barcode scanner with gui (Kevin and John)
 *Figure out how to tell if input is done
-Fit other views to the screen. (Juan)
-Decide what will be on help tab (All)
-Integration transactions with pos.html
-Finish fail flags (Not selecting platinum, not putting right amount of money in, scan card, etc.) (John)
-Printer config script (John)
-Integrate db into code (John)

ONGOING
-Bug check Wi-Fi (John)
 *Check why connection that is discarded is permanently gone.
-Bug test red cancel button bug (ongoing, John)
-Bug test search inventory
-Bug test handling sessions locally (Juan)
-Bug testing pos.html (John)
-POS workflow updates
-Bug test Inventory and Platinum DB
-Bug test jboard
-Bug test ticket transactions
-POS workflow update (John)

Optimize code by minimizing inventory searches. Can grab values in first search or etc.
possble code chanages: make search inventory into function, optimize it
make adding item to customer list a function

-Alignment for price is only viable on the rPi screen not on large screens
-confirm while switching platinums bug
*/
