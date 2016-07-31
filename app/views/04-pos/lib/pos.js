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
