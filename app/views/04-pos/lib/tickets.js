/***********************TICKET.JS***********************/
/*Function that verifies tif the current scanned item is a ticket. */
function verify_ticket(barcode) {
	var scan_prefix = barcode.substring(0, 6);
	scan_prefix = scan_prefix.substring(0, 1) + "0" + scan_prefix.substring(1, scan_prefix.length - 1);
	var places = [];
	var i = -1;
	var ticket = inventory.find(function(e) {
		i++;
		if(e.barcode != null) {
			if(e.barcode.search(scan_prefix) != -1 && e.isticket == 1)
				return true;
		}
	})
	if(ticket == undefined)
		return -1;
	else if(ticket_flag != 1){
		current_ticket[0] = i;
		var title = inventory[i].title;
		var j = find_in_customer_list("title", title);
		current_ticket[1] = j;
		current_ticket[2] = barcode.substring(6, barcode.length - 1);
	}
}
/*21610 1  027067   3*/
function add_to_table(start, quantity) {
	for(var i = 0; i < quantity; i++) {
		var tck_cnt = Number(start.substring(6, 12));
		tck_cnt+=i;
		if(start[6] == "0")
		tck_cnt = "0" + tck_cnt.toString();
		console.log(tck_cnt);
		ticket_table.put(start.replace(start.substring(6, 12), tck_cnt).toString(), true);
		console.log("A");
	}
	console.log("TABLE");
	console.log(ticket_table.keys());
}

function handle_tickets(barcode) {
	var ticket;
	if(ticket_flag == 0) {
			console.log("A");
			ticket_flag = 1;
			confirm_flag = 0;
			cancel_flag = 0;
			previous_ticket = barcode;
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/tickets.html', 'utf-8') , {}));
			refocus();
	}
	/*Add <= 50 functionality here*/
	else if(ticket_flag == 1) {
		console.log("B");
		var itm_qnt = Number(barcode.substring(6, barcode.length - 1)) - Number(current_ticket[2]) + 1;
		if(itm_qnt > 50) {
			$('#modal7').openModal({
				dismissible: false, // Modal can be dismissed by clicking outside of the modal
				opacity: .5, // Opacity of modal background
				in_duration: 300, // Transition in duration
				out_duration: 200, // Transition out duration
			});
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
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		else if(current_ticket[1] != -1) {
			item_list[current_ticket[1]].cust_quantity+=(itm_qnt);
			add_item(current_ticket[1], current_ticket[0], item_list[current_ticket[1]].cust_quantity, 0)
			add_to_table(previous_ticket, itm_qnt);
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		ticket_flag = 0;
		confirm_flag = 1;
		cancel_flag = 1;
		refocus();
	}
}
