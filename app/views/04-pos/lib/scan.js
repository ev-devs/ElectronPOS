/*********************************************NOTE: BEGIN SCAN CODE*********************************************/
/*When the #scan_sim button is click carry out the following callback*/
/*$(document).on("input", "#barcode", function()  {

  $('#modal7').openModal({
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
  });
});
*/
$("#TEST").click(function() {
  refocus();

})
$("#scan_sim").click(function()  {
  /*Grab the barcode from the text area about*/
  var barcode = $("#barcode").val();
  /*Pass into  this function, which is defined below. See the function to know what it does.*/
	var k = -1;
	if(barcode[0] == '2' && barcode.length != 1 && current_platinum != "NONE") {
		k = verify_ticket(barcode);
	}
	var ticket;
  console.log(ticket_table.get(barcode))
	/*BRANCH which handles ticket transactions*/
	if(k != -1 && current_platinum != "NONE" && ticket_table.get(barcode) == undefined/*previous_ticket < Number(barcode.substring(6, barcode.length - 1))*/) {
		if(ticket_flag == 0) {
        console.log("A");
				ticket_flag = 1;
				confirm_flag = 0;
				cancel_flag = 0;
        previous_ticket = barcode;
				$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/tickets.html', 'utf-8') , {}));
		}
		/*Add <= 50 functionality here*/
		else if(ticket_flag == 1) {
      console.log("B");
      var itm_qnt = Number(barcode.substring(6, barcode.length - 1)) - Number(current_ticket[2]) + 1;
      if(itm_qnt > 50) {
        console.log("TOO MUCH FAM");
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
			}
			else if(current_ticket[1] != -1) {
				item_list[current_ticket[1]].cust_quantity+=(itm_qnt);
				add_item(current_ticket[1], current_ticket[0], item_list[current_ticket[1]].cust_quantity, 0)
        add_to_table(previous_ticket, itm_qnt);
			}
			ticket_flag = 0;
			confirm_flag = 1;
			cancel_flag = 1;
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
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
