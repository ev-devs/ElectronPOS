$("#yes-cash").click(function () {
	void_order(1);
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
});

/*Renders the necessary partial for completing orders with cash.*/
$(document).on("click", "#cash", function () {
	/*Sets the cash flag to true to denote a cash transaction is in process*/
  cash_flag = 1;
	previous_page = "pay_choice.html";
	current_page = "cash.html"
	colorfy();
	console.log("PREV:" + previous_page);
	console.log("CUR:" + current_page);
	/*Renders the html file necessary to handle cash transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
});
