/***********************CONFIRM.JS***********************/
$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1 && $("#confirm").text() != "Void" && current_page == "handle_order.html") {
		console.log("A");
		/*If the length of the list of item is 0 (empty list) then there is nothing to confirm. Otherwise render the pay options.*/
    if(item_list.length != 0) {
			/*If we aren't in the middle of a transaction and can confirm normally then render the options*/
      if(confirm_flag == 1) {
				/*Set the confirm flag to 0 to denote that we are in the middle of a transaction*/
        confirm_flag = 0;
				scan_flag = 0;
				previous_flag = 1;
				previous_page = "handle_order.html";
				current_page = "pay_choice.html";
				$("#cancel").css("background-color", "red");
				$("#cancel").text("Back");
				init_transaction();
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
      }
    }
		else
			refocus();
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
	else if(current_page == "return.html") {
		console.log("B");
		if(item_list.length != 0) {
			previous_page = "return.html";
			current_page = "card.html";
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
		}
	}
  else if(cash_flag) {
		console.log("C");
		handle_cash();
  }
	else if(card_flag) {
		console.log("D");
		if(current_page != "card.html" && current_page != "card_input.html")
			handle_card();
		else if (current_page == "card_input.html") {
			if($("#card_type").val() != "" && $("#first_name").val() != ""
			&& $("#last_name").val() != "" && $("#card_num").val() != ""
			&& $("#m_exp").val() != "" && $("#y_exp").val()) {
				if(isNaN($("#m_exp").val()) || isNaN($("#y_exp").val())) {
					Materialize.toast('Please input a proper date!', 3000)
				}
			  else if(isNaN($("#card_num").val())) {
					Materialize.toast('Please input a proper card number!', 3000)
				}
				else {
					handle_virtual_terminal();
					$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , { current: "Processing" }));
				}
			}
			else {
				Materialize.toast('Please input all the proper fields!', 3000)
			}
		}

	}
	else if($("#confirm").text() == "Accept") {
		console.log("E");
		acceptSignature()
	}
	else if($("#confirm").text() == "Void") {
		console.log("F");
		$('#voidModal1').openModal({
			dismissible: false, // Modal can be dismissed by clicking outside of the modal
			opacity: .5, // Opacity of modal background
			in_duration: 300, // Transition in duration
			out_duration: 200, // Transition out duration
		});
	}
	else if(current_platinum == "NONE") {
		console.log("G");
		error_platinum();
	}
});

function init_transaction() {
	cur_transaction = new Transaction();
	cur_transaction.createGUID(); // this is where we assing the GUID. DO NOT CALL guid.create()
	cur_transaction.populateItems(function(transaction){

			transaction.platinum  = current_platinum.replace(/1/g, " ").replace(/2/g, ",");  //=> Here you should modify the platinum name
			transaction.dateCreated = new Date();     //=> Using the date.now() methd you should be fine
			transaction.subtotal = subtotal;   //=> this is the raw subtotal without taxes
			transaction.tax = tax;    //=> this can be calculated via a function with the data we get from the event
			transaction.total = total;      //=> this is just adding subtotal and tax together
			transaction.payments = 0;   //=> the amount of payments that will be made. At least 1
			transaction.city = event_info.meeting[0].city;
			transaction.state = event_info.meeting[0].state;
			transaction.zip = event_info.meeting[0].zip;
			transaction.cashier = cashier.firstname + " " + cashier.lastname;
			transaction.event_type = event_info.meeting[0].type;
			transaction.isEnglish = event_info.meeting[0].isenglish;
			var date = Math.round(transaction.dateCreated.getTime()/1000);
			date = date.toString().substring(date.toString().length - 7, date.toString().length);
			transaction.receiptId = "2" + deviceID + date;
		for (var i = 0; i < item_list.length; i++){

				let item = {
					guid : cur_transaction.guid,
					evid 		: item_list[i].id,
					barcode 	: item_list[i].barcode,
					title		: item_list[i].title,
					isticket	: item_list[i].isticket,
					prefix		: item_list[i].prefix,
					price		: item_list[i].price,
					tax			: item_list[i].price * tax_rate,
					quantity : item_list[i].cust_quantity,
					cashier : cashier.lastname + ", "+ cashier.firstname
				}

				transaction.items.push(item);
			}
	});
}
