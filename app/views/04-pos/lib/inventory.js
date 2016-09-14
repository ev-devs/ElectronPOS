//take the user input and check if delete.
//  if not delete, then append char to inventory input string
// Search each element in the inventory simple array for the inventory input strings
// If found append element to a new arra
// put new array onto stack and display array
// IF delete key was pressed, remove the last char from the inventory input string &
// pop the last array on the stack and display previous array.
//For the young man named Kevin

/***********************INVENTORY.JS***********************/
var search_param = "";
$("#search").on('jpress', function(event, key){
		current_page = "inventory.html";
		previous_page = "handle_order.html";
		$("#cancel").css("background-color", "red");
		$("#cancel").text("Back");
		if(current_platinum != "NONE") {
			if (!(key == "enter" || key=="shift" || key == "123" || key == "ABC")){
				if(key == "delete"){
					inventory_input = inventory_input.substring(0,inventory_input.length - 1)
					inventory_delete_flag = 1;
				}
				else {
					var k = key
					if(k == "space"){
						k = " "
					}
					inventory_input = inventory_input + k
					inventory_delete_flag = 0;
				}
				if(inventory_input != ""){
					searched_inventory = search_list(inventory_stack, inventory_input, inventory_delete_flag)
					$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/inventory.html', 'utf-8') , {"query_results" : searched_inventory}));
					console.log("THIS IS THE SEARCHED INVENTORY vvvvvv")
					console.log(searched_inventory);

					//display_list(searched_inventory);
				}
				else if(inventory_input == ""){
					searched_inventory = [];
					$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/inventory.html', 'utf-8') , {"query_results" : searched_inventory}));
					inventory_stack = [];
					inventory_stack.push(inventory_simple)
					inventory_delete_flag = 0;
				}
			}
		}
		else {
			error_platinum();
		}
});

var search_param;
$(document).on("click",  ".item", function() {
	search_param = $(this).attr("id");
	$("#selected_item").text(inventory[search_param].title);
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
	$("#cancel").removeAttr("style");
	$("#cancel").text("Cancel");
	current_page = "handle_order.html";
	if(quantity != 0 && quantity != "") {
		var i = find_in_customer_list("barcode", barcode)
			if(i != -1) {
				item_list[i].cust_quantity+=Number(quantity);
				add_item(i, search_param, quantity, 0)
			}
			else {
				var item = inventory[search_param]
				item['cust_quantity'] = Number(quantity);
				item_list.push(item);
				add_item(item_list.length - 1, search_param, quantity, 1);
				f = 1;
			}
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
			refocus();
		}
		else {
			console.log("NO ITEM QUANTITY ADDED");
		}
		inventory_input = "";
		$("#search").val("");
});

$(document).on("click",  "#cancel_item_selection", function() {
	refocus();
	inventory_input = "";
	$("#cancel").removeAttr("style");
	$("#cancel").text("Cancel");
	$("#search").val("");
	current_page = "handle_order.html";
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
});

//For the young man named Kevin
function fill_simple_inventory(_inventory_) {
	for(var i = 0; i < _inventory_.length; i++) {
		var combined_title = _inventory_[i].title + "-" + _inventory_[i].price + "-_" + i;
		inventory_simple.push(combined_title);
	}
	console.log(inventory_simple);
	inventory_stack.push(inventory_simple)
}
