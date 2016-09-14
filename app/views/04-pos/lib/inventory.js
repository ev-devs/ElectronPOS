/***********************INVENTORY.JS***********************/

//take the user input and check if delete.
//  if not delete, then append char to inventory input string
// Search each element in the inventory simple array for the inventory input strings
// If found append element to a new arra
// put new array onto stack and display array
// IF delete key was pressed, remove the last char from the inventory input string &
// pop the last array on the stack and display previous array.

var search_param = "";
$(document).on( "jpress", "#search" , function(event, key){
		if(current_platinum != "NONE") {
			if (!(key == "enter" || key=="shift" || key == "123" || key == "ABC")){
				if(key == "delete"){
					if(inventory_input != ""){
						inventory_input = inventory_input.substring(0,inventory_input.length - 1)
					}
					else if(inventory_input == ""){
						inventory_input = "";
					}
					inventory_delete_flag = 1;
				}
				else {
					var k = key
					//Solve special Character case
					// if(k == "?" || k =="#" || k == "@" || k == "/" || k == "\\" || k == "<" ||
					// 	k == ">" || k == "." || k == "," || k == "\"" || k == "\'" || k == "{" ||
					// 	k == "}" || k == "[" || k == "]" || k == "$" || k == "%" || k == "^" ||
					// 	 k == "*" || k == "(" || k == ")" || k == "`" || k == "~" || k == "+" ||
					// 	 k == "-" || k == "=" || k == "_" || k == "|" || k == "1" || k == "2" ||
					// 	 k == "3" || k == "4" || k == "5" ||k == "6" || k == "7" || k == "8" ||
					// 	 k == "9" || k == "0" || k == ";"){
					// 	//$('#enter-platinum').val( $('#enter-platinum').val().substring(0, $('#enter-platinum').val().length - 1) )
					// 	Materialize.toast("Please Enter a Valid Character", 5000)
					//
					// 	k = " "
					// }
					if(k == "space"){
						k = " ";
					}
					inventory_input = inventory_input + k;
					inventory_delete_flag = 0;
				}
				if(inventory_input != ""){
					searched_inventory = search_list(inventory_stack, inventory_input, inventory_delete_flag)
					display_list(searched_inventory);
				}
				if(inventory_input == ""){
					$("#platinums-list").empty();
					var inventory_input = ""; // user_input for inventory search
					var searched_inventory = []; //modified array of searched inventory
					var inventory_stack = [];  // stack of arrays for inventory
					inventory_stack.push(inventory_simple);
					var inventory_delete_flag = 0; //signals if delete key was pressed in inventory
				}



				// var query = $(this).val();
				// if(scan_flag == 1) {
				// 	query = new RegExp(query, "i");
				// 	inventory_query.splice(0, inventory_query.length);
				// 	$("#item_list").empty();
				// 	var i = -1;
				//
				//   inventory.find(function(e) {
				// 		i++;
				// 		if(e.barcode != null) {
				// 			if((e.title.search(query) != -1) || (e.barcode.search(query) != -1)) {
				// 				var item = [];
				// 				item.push(e.title);
				// 				item.push(e.price);
				// 				item[0]+=("-_" + i);
				// 				inventory_query.push(item);
							// }
					//
					//
					// 	}
					// });
				// 	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/inventory.html', 'utf-8') , {"query_results" : inventory_query}));
				// }
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

//For the young man named Kevin
function fill_simple_inventory(_inventory) {
	for(var i = 0; i < _inventory.length; i++) {
		var combined_title = _inventory.title + "-" + _inventory.price + "-_" + i;
		inventory_simple.push(combined_title);
	}
	inventory_stack.push(inventory_simple);
}
