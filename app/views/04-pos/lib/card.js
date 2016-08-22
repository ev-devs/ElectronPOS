/***********************CARD.JS***********************/
/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "card_amt.html";
	colorfy();
	/*Renders the html file necessary to handle card transactions*/

	console.log("ENTERED");
	$('#tendered_card-modal').remove()
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
<<<<<<< HEAD
/*
function start_transaction(cardNumber, expDate, ccv) {
=======

function start_transaction(cardInfo) {
>>>>>>> f2319ca5e336c6f0157101dc196d620647b9cc5d
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
				/*If all the money was on the card then go to the printing option
				card_trans(obj.transAuthCode, obj.transId, obj.transMessage);
			}
			else {
				console.log(obj.transMessage)
				console.log("Error Code:", obj.transErrorCode)
				console.log("Error Text:", obj.transErrorText)
			}
		});
}
*//*
var card_date;
function card_trans(transAuthCode, transId, transMessage) {
	cur_transaction.createCardTransaction(function(transaction){
		let CardTrans = {
			guid     : transaction.guid,
			amount   : card_amt,
			authCode : transAuthCode,
			transId  : transId,
			message  : transMessage,
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
}*/
/*
var card_date;
function card_trans(transAuthCode, transId, transMessage) {
	cur_transaction.createCardTransaction(function(transaction){
		let CardTrans = {
			guid     : transaction.guid,
			amount   : card_amt,
			authCode : transAuthCode,
			transId  : transId,
			message  : transMessage,
			cardType : "Harambe",
			dateCreated : new Date(),
			voidable : true,
			voided   : false
		}
		transaction.cards.push(CardTrans);
		transaction.payments++;
	});

	if(card_amt == Number(accounting.formatNumber(total, 2, ",").replace(/,/g, ""))) {
		//void_order(1);
		//$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
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
		$("#cancel"%B6010569719163353^11027541/89^25010004000060084713           ?;6010569719163353=25010004000060084713?).css("background-color", "red");
	}
}
*/
/*function card_call_to_auth() {
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
			/*If all the money was on the card then go to the printing option
			card_trans(obj.transAuthCode, obj.transId, obj.transMessage);
		}
		else {
			console.log(obj.transMessage)
			console.log("Error Code:", obj.transErrorCode)
			console.log("Error Text:", obj.transErrorText)
		}
	});
}*/
