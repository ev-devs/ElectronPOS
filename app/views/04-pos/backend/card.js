/*********************************************NOTE: BEGIN CARD TRANSACTION CODE*********************************************/
/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "card_amt.html";
	colorfy();
	console.log("PREV:" + previous_page);
	console.log("CUR:" + current_page);
	/*Renders the html file necessary to handle card transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_amt.html', 'utf-8') , {"total" : accounting.formatNumber(total, 2, ",")}));
});


$(document).on("click", "#swipe_sim", function() {
	/*Set the cancel flag to prevent any cancellations once the card is in the processing stages*/
  cancel_flag = 0;
	previous_flag = 0;
	/*Only allows the swipe button to render the process.html file if the card option is the selected pay option*/
  if(card_flag && swipe_flag) {
		$("#cancel").removeAttr("style");
		$("#confirm").removeAttr("style");
		confirm_flag = 0;
		card_flag = 0;
		/*THIS CODE CAN BE REWRITTEN IN A BETTER MANNER BUT RIGHT NOW THIS WILL DO*/
		cancel_flag = 0;
		previous_flag = 0;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , {}));
    setTimeout(function() {
			if(card_amt == Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
				void_order(1);
			  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
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
    }, 3000);
  }
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});
