/*********************************************NOTE: BEGIN CANCEL ORDER CODE*********************************************/



$("#cancel").click(function() {

  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1 && $(this).css('background-color') != 'rgb(255, 0, 0)') {
    $('#modal2').openModal();

	}
  else if(previous_flag) {

		if(current_page == "pay_choice.html") {
			console.log("1");
			confirm_flag = 1;
			scan_flag = 1;
			previous_flag = 0;
			current_page = "handle_order.html"
			previous_page = "handle_order.html"
			$("#cancel").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		else if(current_page == "card_amt.html") {

			current_page = "pay_choice.html";
			previous_page = "handle_order.html";
			card_flag = 0;
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
		else if(current_page == "cash.html") {

			current_page = "pay_choice.html"
			previous_page = "handle_order.html"
			cash_flag = 0;
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
		else if(current_page == "card.html") {
			current_page = "card_amt.html"
			previous_page = "pay_choice.html"
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
	}
	else if(current_platinum == "NONE"){
		error_platinum();
	}
});

$("#y_cancel").click(function() {
	/*As long as the length of the list is > 0 then cancellations can happen*/
  if(item_list.length != 0) {
		/*Voids the order*/
    void_order(1);
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		/*Fades out the "thanks" element from the compelte.html file*/
    setTimeout(fade_out, 1500);
		void_order(1);
		/*Refocus the page on the barcode input*/
    refocus();
  }
});
