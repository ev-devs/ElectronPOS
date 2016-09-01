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
