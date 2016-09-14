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

var card_type;
var card_holder;
var card_num;
var card_exp;
function handle_virtual_terminal() {
	card_type = creditCardValidator.getCardName($("#card_num").val());
	card_holder = $("#first_name").val() + " " + $("#last_name").val();
	card_num = $("#card_num").val();
	card_exp = $("#m_exp").val() + $("#y_exp").val();
	var newTrans = new transaction();
	newTrans.chargeCreditCard({
					cardnumber  : card_num, //"4242424242424242",
					expdate     : card_exp, //"0220",
					ccv         : "123", // this can be anything since we don't send this to auth net anyways
					amount      : card_amt.toString()
		}).then(function(obj){
			if (!obj.error){
					// catches error from the server
					if (obj.transMessage == null &&  obj.transId == null && obj.transAuthCode == null){
							console.warn("There was an error getting a response from the server")
							Materialize.toast('There was an error getting a response from the server', 8000) // 4000 is the duration of the toast
							setTimeout(function(){
									$("#cancel").css("background-color", "red");
									$("#confirm").css("background-color", "green");
									confirm_flag = 0;
									card_flag = 1;
									cancel_flag = 0;
									previous_flag = 1;
									$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));

							}, 3000)
					}
					else {
							console.log(obj.transMessage)
							console.log("Trasaction Id:", obj.transId)
							console.log("Authorization Code:", obj.transAuthCode)
							/*If all the money was on the card then go to the printing option*/
							card_flag = 0;
							card_trans(obj.transAuthCode, obj.transId, obj.transMessage, card_holder, card_num, card_type);
							card_num = "";
					}
			}
			else {
					// catches error from the server
					if (obj.transMessage == null && obj.transErrorCode == null && obj.transErrorText == null){
							console.warn('We did not get a response from the server!')
							Materialize.toast('There was an error getting a response from the server', 8000)
							setTimeout(function(){
								$("#cancel").css("background-color", "red");
								$("#confirm").css("background-color", "green");
								confirm_flag = 0;
								card_flag = 1;
								cancel_flag = 0;
								previous_flag = 1;
								$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
							}, 3000)
					}
					else {
							console.log(obj.transMessage)
							console.log("Error Code:", obj.transErrorCode)
							console.log("Error Text:", obj.transErrorText)
							Materialize.toast(obj.transMessage, 8000)
							Materialize.toast(obj.transErrorText, 8000)
							setTimeout(function(){
								$("#cancel").css("background-color", "red");
								$("#confirm").css("background-color", "green");
								confirm_flag = 0;
								card_flag = 1;
								cancel_flag = 0;
								previous_flag = 1;
								$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
							}, 3000)
					}
			}
		});
}
function card_trans(transAuthCode, transId, transMessage, name, digits, card_type) {
    cur_transaction.createCardTransaction(function(transaction){
        let CardTrans = {
            guid     : transaction.guid,
            amount   : card_amt,
            card_holder : name,
            digits : digits.substring(digits.length - 4, digits.length), //Stores last 4 digits
            authCode : transAuthCode,
            transId  : transId,
            message  : transMessage,
            cardType : card_type,
            dateCreated : new Date(),
            voidable : true,
            voided   : false,
						signature : "NONE"
        }
        transaction.cards.push(CardTrans);
        transaction.payments++;
    });
    $("#cancel").text("Clear");
    $("#confirm").text("Accept");

    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/sign.html', 'utf-8') , {}));
}
