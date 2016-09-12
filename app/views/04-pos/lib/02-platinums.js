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
		leaders_list.push(name.trim());
	}
	leaders_list.sort();
	platinums_stack.push(leaders_list);
}

/*
 * Get the stack , user input, and flag
 * I need it to access the last element in the stack, search the element for the user input, 
 * put the searched strings into a new array and then put new array into the stack
 * If delete flag set, take the stack, pop the last element, proceed as normal 
*/
function search_list(list, input, flag){
	var searched = [];
	if(list.length <= 0){
		console.log("WARNING: EMPTY PLATINUMS STACK")
	}
	if(flag == 1){
		list.pop()
	}
	var last_from_stack = list[list.length -1]
	console.log(last_from_stack)
	var Reg_input = new RegExp(input, "i")
	for(i = 0; i < last_from_stack.length; i++){
		if(last_from_stack[i].search(Reg_input) != -1){
			searched.push(last_from_stack[i]);
		}
	}
	if(flag == 0){
		list.push(searched)
		return searched
	}
	else{
		flag = 0;
		return searched;
	}
}

$(document).on( "jpress", "#enter-platinum" , function(event, key){
   console.log(platinums_stack[0]);
   if(key != "shift" && key != "enter" && key != "123" && key != "ABC") {
		if(key == "delete"){
			user_input = user_input.substring(0,user_input.length - 1)
			delete_flag = 1;
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
				//$('#enter-platinum').val( $('#enter-platinum').val().substring(0, $('#enter-platinum').val().length - 1) )
				Materialize.toast("Please Enter a Valid Character", 5000)
				
				k = " "
			}
			if(k == "space"){
				k = " "
			}
			user_input = user_input + k
			delete_flag = 0;
		}
		if(user_input != ""){
			searched_leaders = search_list(platinums_stack, user_input, delete_flag)
			display_list(searched_leaders);
		}
		else if(user_input == ""){
			$("#platinums-list").empty();
			platinums_stack = [];
			platinums_stack.push(leaders_list)
			delete_flag = 0;
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
