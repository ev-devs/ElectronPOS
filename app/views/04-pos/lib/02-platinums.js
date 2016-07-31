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
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '../partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
	//$("#current-platinum").attr("placeholder", current_platinum.replace(/1/g, " ").replace(/2/g, ","));
});

$("#platinum").click(function() {
	if(current_platinum != "NONE" && confirm_flag == 1) {
		current_platinum = "NONE";
		confirm_flag = 0;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '../partials/select_platinums.html', 'utf-8') , {"A" : 0}));
	}
})
