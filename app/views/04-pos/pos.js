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
function selectPlatinum(list, searched){
	var user_input = "";
	var name = "";
	$("#enter-platinum").change(function(){
			user_input = $("#enter-platinum").val();
			if(user_input != ""){
				searched = [];
				var re = new RegExp(user_input.toString(), "i");
				for(var i = 0; i < list.length; i++){
					if(list[i].search(re) != -1){
						searched.push(list[i]);
					}
				}
				console.log(searched);
			}
		});
	
}
function display_list(list){
	var name = "";
	for(var i = 0; i < list.length; i++){
		 name = "<a href=\"#!\" class=\"collection-item\">" + list[i].toString() + "</a>";
		 $("#platinums-list").append(name);
	}
}

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
					display_list(leaders_list);
					selectPlatinum(leaders_list, list_names)
					$('#platinums-list').show()
					$('.loading').hide()

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

document.addEventListener('refocus', function(e) {
  $("#barcode").focus();
})
function refocus() {
  var event = new CustomEvent('refocus');
  document.dispatchEvent(event);
}

$(".keyboard").keyboard({
  restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
  preventPaste : true,  // prevent ctrl-v and right click
  autoAccept : true,
  layout: "num"
});
/*1, H0187, H0192*/
/*Item_list is the list of items the cusotmer has*/
var item_list = [];
/*Next 3 variables are self-explanatory. Just look at their name.*/
var subtotal = 0.00;
var tax = 0.00;
var total = 0.00;
/*Holds the id of the current item (id attribute assigned in the <tr> tage below). Is changed in one of the below functions*/
var item_id = "";
var item_num = 0;

/*BEGIN SCAN CODE*/
/*When the #scan_sim button is click carry out the following callback*/
$("#scan_sim").click(function()  {
  /*Grab the barcode from the text area about*/
  var barcode = $("#barcode").val();
  /*Pass into  this function, which is defined below. See the function to know what it does.*/
  var i = determine_item_status(item_list, inventory, barcode);
  /*If the item in the list has a quantity of one then this means it is not present on the gui and must be put into the gui
  with the code below.*/
  if(i != -1) {
    if(item_list[i].cust_quantity == 1) {
      /*The item variable contains the html for the <tr> tag which displays our item in the gui. We give this tag an id of "itemx"
      where x represents where the item is in the "item_list" variable above. We then go to that place in the list and list out the key
      values as the text values of the td tags.*/
      var item = "<tr class=\"whole-item animated fadeIn\" id=\"item" + i.toString() + "\"> \
       <td class=\"eq-cells name \" style=\"width: 77%;\"><span class=\"truncate\" id=\"" + item_list[i].title.replace(/ /g, "_") + "\">\
       x" + item_list[i].cust_quantity + ": " + item_list[i].title + "</span></td> \
       <td class=\"eq-cells price\" style=\"width: 23%; border-left: 1px solid #ddd;\">$" + item_list[i].price + "</td> \
      </tr>"
      /*Append to the table that holds the items*/
      $("#sale_list tbody").append(item);
    }
    /*If the item is in the list then just go to its place and increment its counter and update the gui*/
    else {
      //var item = $("#qnt-item-" + i).text().trim().toString();
			var item = $("#" + item_list[i].title.replace(/ /g, "_")).text().trim().toString();
			console.log(item)
      var qnt = item.substring(item.indexOf("x") + 1, item.indexOf(": "));
      item = item.replace(qnt.toString(), item_list[i].cust_quantity.toString());
      $("#" + item_list[i].title.replace(/ /g, "_")).text(item);
    }
		cancel_flag = 1;
  }
  /*Update the global quantities of subtotal, tax, and total*/
  subtotal+=item_list[i].price;
  $("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",").toString());
  tax = subtotal * .075;
  $("#tax").text("$" + accounting.formatNumber(tax, 2, ",").toString());
  total = subtotal + tax;
  $("#total").text("$" + accounting.formatNumber(total, 2, ",").toString());
  $("#barcode").focus();
});
