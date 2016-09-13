/***********************CARD.JS***********************/
/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "card_amt.html";
	colorfy();
	/*Renders the html file necessary to handle card transactions*/

	$('#tendered_card-modal').remove();
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_amt.html', 'utf-8') , {"total" : accounting.formatNumber(total, 2, ",")}));
});


$(document).on("click", "#swipe_sim", function() {
	/*Set the cancel flag to prevent any cancellations once the card is in the processing stages*/
  cancel_flag = 0;
	previous_flag = 0;
	/*Only allows the swipe button to render the process.html file if the card option is the selected pay option*/
  if(card_flag && swipe_flag) {
		//card_call_to_auth();
		$("#cancel").removeAttr("style");
		$("#confirm").removeAttr("style");
		confirm_flag = 0;
		card_flag = 0;
		/*THIS CODE CAN BE REWRITTEN IN A BETTER MANNER BUT RIGHT NOW THIS WILL DO*/
		cancel_flag = 0;
		previous_flag = 0;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , {}));
  }
	else if(current_platinum == "NONE") {
		error_platinum();
	}
});

$(document).on("click", "#card-input", function() {
	current_page = "card_input.html";
	previous_page = "card.html";
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card_input.html', 'utf-8') , {}));
});

function handle_card() {
	if(card_amt != 0) {
		current_page = "card.html";
		previous_page = "card_amt.html";
		card_amt = Number($("#tendered_card").val().replace(/,/g, ""));
		swipe_flag = 1;
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
	}
}

function handle_virtual_terminal() {
	
}
