/***********************CASH.JS***********************/
$("#yes-cash").click(function () {
	//void_order(1);
	//$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
	print_init();
});

/*Renders the necessary partial for completing orders with cash.*/
$(document).on("click", "#cash", function () {
	/*Sets the cash flag to true to denote a cash transaction is in process*/
  cash_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "cash.html"
	colorfy();
	$('#tendered-modal').remove()
	/*Renders the html file necessary to handle cash transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
});

function handle_cash() {
	/*Updates the cur_transaction JSON object with the proper information for the transaction*/
	cash_trans();
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
}

function cash_trans(){
	cur_transaction.createCashTransaction(function(transaction){

			let CashTrans = {
				guid 			: transaction.guid,
				tendered  : Number($("#tendered").val().replace(/,/g, "")),
				change 		: Number($("#change").text().substring(1, $("#change").text().length))
			}
			transaction.cashes.push(CashTrans);
			transaction.payments++;
	});
}
