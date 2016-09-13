/***********************CANCEL.JS***********************/
$("#cancel").click(function() {

  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1 && $(this).css('background-color') != 'rgb(255, 0, 0)') {
    $('#modal2').openModal();
    console.log("CANCEL");
	}
  else if(previous_flag || $(this).css('background-color') == 'rgb(255, 0, 0)') {
    console.log("PREVIOUS");
		if(current_page == "pay_choice.html") {
			console.log("1");
			confirm_flag = 1;
			scan_flag = 1;
			previous_flag = 0;
			current_page = "handle_order.html";
			previous_page = "handle_order.html";
      refocus();
			$("#cancel").removeAttr("style");
      $("#cancel").text("Cancel");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
		}
		else if(current_page == "card_amt.html") {
      console.log("2");
			current_page = "pay_choice.html";
			previous_page = "handle_order.html";
			card_flag = 0;
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
		else if(current_page == "cash.html") {
      console.log("3");
			current_page = "pay_choice.html"
			previous_page = "handle_order.html"
			cash_flag = 0;
			$("#confirm").removeAttr("style");
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
		else if(current_page == "card.html" && previous_page == "card_amt.html") {
      console.log("4");
			current_page = "card_amt.html"
			previous_page = "pay_choice.html"
			$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
		}
    else if(current_page == "card_input.html") {
      console.log("5");
      current_page = "card.html";
      previous_page = "card_amt.html";
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
    }
    else if(current_page == "prev_trans.html") {
      console.log("6");
      current_page = "select_platinums.html";
      previous_page = "select_platinums.html";
      $('#enter-platinum-modal').remove();
      $("#cancel").removeAttr("style");
      $("#cancel").text("cancel");
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {"A" : 0}));
    }
    else if(current_page == "indv_trans.html" || current_page == "queried_trans.html") {
      console.log("7");
      current_page = "prev_trans.html";
      previous_page = "select_platinums.html";
      $("#confirm").text("confirm");
      $("#confirm").removeAttr("style");
      refocus();
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {transactions: ay}));
    }
    else if(current_page == "return.html") {
      console.log("8");
      current_page = "select_platinums.html";
      previous_page = "select_platinums.html";
      $('#enter-platinum-modal').remove();
      $("#cancel").removeAttr("style");
      $("#cancel").text("cancel");
      void_order(1);
      refocus();
    }
    else if(current_page == "card.html" && previous_page == "return.html") {
      console.log("9");
      current_page = "return.html"
      previous_page = "select_platinums.html"
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
    }
	}
  else if($("#cancel").text() == "Clear") {
    console.log("We cleared");
    clearSignaturePad()
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
