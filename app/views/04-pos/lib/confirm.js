/***********************CONFIRM.JS***********************/
$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1) {
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
		handle_card();
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
			transaction.location = "Harambe's Heart, Ohio"  //=> this can be reached from the main.js process via ipc
			transaction.subtotal = subtotal   //=> this is the raw subtotal without taxes
			transaction.tax = tax    //=> this can be calculated via a function with the data we get from the event
			transaction.total = total      //=> this is just adding subtotal and tax together
			transaction.payments = 50   //=> the amount of payments that will be made. At least 1


		for (var i = 0; i < item_list.length; i++){

				let item = {
					guid : cur_transaction.guid,
					evid 		: item_list[i].id,
					barcode 	: item_list[i].barcode,
					title		: item_list[i].title,
					isticket	: item_list[i].isticket,
					prefix		: item_list[i].prefix,
					price		: item_list[i].price,
					tax			: item_list[i].price * .0875
				}

				transaction.items.push(item);
			}
	});
}
