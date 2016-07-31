/*********************************************NOTE: BEGIN TICKET TRANSACTION CODE*********************************************/
/*Function that verifies tif the current scanned item is a ticket. */
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
