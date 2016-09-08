/***********************SCAN.JS***********************/

$("#barcode").change(function() {
  /*Grab the barcode from the text area about*/
  var barcode = $("#barcode").val();
  /*Pass into  this function, which is defined below. See the function to know what it does.*/
  /*BRANCH which handles ticket transactions*/
	var k = -1;
	if(barcode[0] == '2' && barcode.length != 1 && current_platinum != "NONE" && current_page != "prev_trans.html") {
		k = verify_ticket(barcode);
	}
  console.log("Q");
	if(k != -1 && current_platinum != "NONE" && ticket_table.get(barcode) == undefined) {
    handle_tickets(barcode);
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
  else if(current_page == "prev_trans.html") {
    console.log("W");
    Transaction.findOne({receiptId : barcode.substring(0, barcode.length - 1)}, function(err, _transaction) {
       console.log(_transaction);
       if(_transaction) {
         current_page = 'queried_trans.html';
         previous_page = 'prev_trans.html';
         $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/queried_trans.html', 'utf-8') , { transaction : _transaction }));
        }
       else
        console.log("Not found");
    });;
  }
	else if(k == -1 && current_platinum != "NONE"){
    console.log("E");
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
  $("#barcode").val("");
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
