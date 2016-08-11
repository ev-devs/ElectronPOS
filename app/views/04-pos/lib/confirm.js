/*********************************************NOTE: BEGIN CONFIRM ORDER CODE*********************************************/
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
				console.log(cur_transaction);
				cur_transaction = {
					 items : item_list,
					 subtotal : subtotal,
					 tax : tax,
					 total : total,
					 cashes : [],
					 cards : []
				}
				console.log(cur_transaction);
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
      }
    }
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
  else if(cash_flag) {
		/*Updates the cur_transaction JSON object with the proper information for the transaction*/
		cur_transaction.cashes.push({
			tendered : Number($("#tendered").val().replace(/,/g, "")),
			change : Number($("#change").text().substring(1, $("#change").text().length).replace(/,/g, ""))
		});
		/*Renders the html file necessary to denote the transaction is complete*/
		if(Number($("#tendered").val().replace(/,/g, "")) >= accounting.formatNumber(total, 2, ",").replace(/,/g, "")) {
			$('#modal6').openModal({
				dismissible: true, // Modal can be dismissed by clicking outside of the modal
				opacity: .5, // Opacity of modal background
				in_duration: 300, // Transition in duration
				out_duration: 200, // Transition out duration
			});
		}
		else {
			update_price('~', Number($("#tendered").val().replace(/,/g, "")), 0, 1)
			cash_flag = 0;
			confirm_flag = 0;
			$("#cancel").removeAttr("style");
			$("#confirm").removeAttr("style");
			current_page = "pay_choice.html";
			previous_page = "handle_order.html";
			$("#cancel").css("background-color", "red");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
		}
		console.log(cur_transaction);
  }
	else if(card_flag) {
		if(card_amt != 0) {
			current_page = "card.html";
			previous_page = "card_amt.html";
			card_amt = Number($("#tendered_card").val().replace(/,/g, ""));
			console.log(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))
			console.log(card_amt);
			swipe_flag = 1;
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
		}
	}
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});
