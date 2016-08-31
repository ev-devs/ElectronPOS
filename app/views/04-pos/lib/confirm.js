/***********************CONFIRM.JS***********************/
$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1 && $("#confirm").text() != "Void") {
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
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
  else if(cash_flag) {
		handle_cash();
  }
	else if(card_flag) {

		if(current_page != "card.html")
			handle_card();
	}
	else if($("#confirm").text() == "Accept") {
		acceptSignature()
	}
	else if($("#confirm").text() == "Void") {
		console.log("VOID");
		$('#voidModal3').openModal({
			dismissible: false, // Modal can be dismissed by clicking outside of the modal
			opacity: .5, // Opacity of modal background
			in_duration: 300, // Transition in duration
			out_duration: 200, // Transition out duration
		});
	}
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});

function init_transaction() {
	cur_transaction = new Transaction();
	cur_transaction.createGUID(); // this is where we assing the GUID. DO NOT CALL guid.create()
	cur_transaction.populateItems(function(transaction){
			// transaction.guid      //=> this is the guid DO NOT MODIFY AND DO NOT ASSIGN ANYTHING
			transaction.platinum  = current_platinum.replace(/1/g, " ").replace(/2/g, ",");  //=> Here you should modify the platinum name
			transaction.dateCreated = new Date();     //=> Using the date.now() methd you should be fine
			transaction.subtotal = subtotal;   //=> this is the raw subtotal without taxes
			transaction.tax = tax;    //=> this can be calculated via a function with the data we get from the event
			transaction.total = total;      //=> this is just adding subtotal and tax together
			transaction.payments = 0;   //=> the amount of payments that will be made. At least 1
			transaction.location = event_info.city + ", " + event_info.state;

		for (var i = 0; i < item_list.length; i++){

				let item = {
					guid : cur_transaction.guid,
					evid 		: item_list[i].id,
					barcode 	: item_list[i].barcode,
					title		: item_list[i].title,
					isticket	: item_list[i].isticket,
					prefix		: item_list[i].prefix,
					price		: item_list[i].price,
					tax			: item_list[i].price * taxrate,
					quantity : item_list[i].cust_quantity,
					cashier : cashier.lastname + ", "+ cashier.firstname
				}

				transaction.items.push(item);
			}
	});
}
/*console.log("card flag");
if(current_page == "card_input.html") {
	console.log("JUAN");
	if($("#first_name").val() != "" && $("#last_name").val() != "" && $("#m_exp").val() != "" && $("#y_exp").val() != "") {
	console.log("JUANA")
	var newTrans = new transaction();
	newTrans.chargeCreditCard({
					cardnumber  : "4242424242424242",
					expdate     : "0220",
					ccv         : "123",
					amount      : card_amt.toString()
		}).then(function(obj){
			if (!obj.error){
				console.log(obj.transMessage)
				console.log("Trasaction Id:", obj.transId)
				console.log("Authorization Code:", obj.transAuthCode)
				//card_trans(obj.transAuthCode, obj.transId, obj.transMessage);
				cur_transaction.createCardTransaction(function(transaction){
					let CardTrans = {
						guid     : transaction.guid,
						amount   : card_amt,
						authCode : obj.transAuthCode,
						transId  : obj.transId,
						message  : obj.transMessage,
						cardType : "Harambe",
						dateCreated : new Date(),
						voidable : true,
						voided   : false
					}
					transaction.cards.push(CardTrans);
					transaction.payments++;
				});

				if(card_amt == Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
					print_init();
				}
				else if(card_amt < Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
					card_flag = 0;
					confirm_flag = 0;
					update_price('~', card_amt, 0, 1)
					$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
					current_page = "pay_choice.html";
					previous_page = "handle_order.html";
					previous_flag = 1;
					$("#cancel").css("background-color", "red");
				}
			}
			else {
				console.log(obj.transMessage)
				console.log("Error Code:", obj.transErrorCode)
				console.log("Error Text:", obj.transErrorText)
			}
		})
	}
	*/
