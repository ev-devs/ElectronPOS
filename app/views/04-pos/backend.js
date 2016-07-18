/*BEGIN DELETE CODE*/
/*When a finger is on the screen and on an item record the start point.
This is how far away the finger is from the left border.*/
$(document).on("touchstart", ".whole-item", function(e) {
  var touchobj = e.originalEvent.changedTouches[0].clientX;
  touchstart = touchobj;
});

/*When the finger leaves the screen, record it's end point in pixels.*/
$(document).on("touchend", ".whole-item", function(e) {
  var touchobj = e.originalEvent.changedTouches[0].clientX;
  touchend = touchobj;
  /*Before seeing if this is a valid swipe take note of the item_id for future use*/
  item_id = $(this).attr("id");
  /*A valid swipe is if the pixel difference from the start to end is 100 pixels. If a valid swipe then bring up the delete confirm modal.*/
  if(touchstart-touchend >= 100) {
    /*Populates the modal with the item name for seller confirmation*/
    $(this).css("background-color", "red");
    /*Whole item taken from the html doc*/
    var item = $(this).find("span").text().trim();
    var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
    var item_name = item.substring(item.indexOf(": ") + 2, item.length);
    if(item_qnt == "1") {
      $('#item_type').text(item_name);
    }
    else {
      /*If there are multiple items to be deleted as how many  an create a form to input the amount*/
      $('#delete_option').html(
        ejs.render(
          fs.readFileSync( __dirname + '/partials/delete_form.html', 'utf-8') , {'max' : item_qnt}
        )
      );
      $('#item_type').text(" how many of " + item_name);
    }
    /*Open modal*/
    $('#modal1').openModal({
      dismissible: false, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
  }
});

$("#y_cancel").click(function() {
	/*As long as the length of the list is > 0 then cancellations can happen*/
  if(item_list.length != 0) {
		/*Voids the order*/
    void_order();
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		/*Fades out the "thanks" element from the compelte.html file*/
    setTimeout(fade_out, 1500);
		/*Sets the confirm flag to 1 denoting an order CAN be confirmed*/
    confirm_flag = 1;
		/*Sets the card flag to 0 denoting a cancelled transaction*/
    cash_flag = 0;
		/*Sets the card flag to 0 denoting a cancelled transaction*/
    card_flag = 0;
		/*Refocus the page on the barcode input*/
    refocus();
  }
});

/*NOTE: BEGIN CONFIRM ORDER CODE*/
/*Flag which denotes that the user can confirm at any time assuming the flag is raised. By default it is raised.*/
var confirm_flag = 1;
/*Flag which denotes the status of a transaction. If it is raised then a card transaction is being done.*/
var card_flag = 0;
/*Flag which denotes the status of a transaction. If it is raised then a cash transaction is being done.*/
var cash_flag = 0;
/*Flag which denotes that the user can cancel at any time assuming the flag is raised. By default it is raised.*/
var cancel_flag = 0;


$("#confirm").click(function() {
	/*If the confirm flag is raised then a normal confirm can happen meaning render  the pay options page*/
  if(confirm_flag == 1) {
		/*If the length of the list of item is 0 (empty list) then there is nothing to confirm. Otherwise render the pay options.*/
    if(item_list.length != 0) {
			/*If we aren't in the middle of a transaction and can confirm normally then render the options*/
      if(confirm_flag == 1) {
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/pay_choice.html', 'utf-8') , {}));
				/*Set the confirm flag to 0 to denote that we are in the middle of a transaction*/
        confirm_flag = 0;
      }
    }
  }
	/*To complete a card transaction, the confirm button must be pressed. If the confirm button is pressed while
	the cash flag is raised then the confirm will Correspond to only a cahs confirm*/
  if(cash_flag == 1) {
		/*Renders the html file necessary to denote the transaction is complete*/
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
		/*Removes the red and green colors form the cancel and confirm button*/
    $("#cancel").removeAttr("style");
    $("#confirm").removeAttr("style");
		/*Sets the confirm flag back to one to denote that a normal completion can happen*/
    confirm_flag = 1;
		/*Cash flag is set to 0 to denote the end of a cash transaction*/
    cash_flag = 0;
  }
});

/*Renders the necessary partial for completing orders with cash.*/
$(document).on("click", "#cash", function () {
	/*Sets the cash flag to true to denote a cash transaction is in process*/
  cash_flag = 1;
	/*Sets the cancel and confirm buttons to red and green respectively*/
  $("#cancel").css("background-color", "red");
  $("#confirm").css("background-color", "green");
	/*Renders the html file necessary to handle cash transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/cash.html', 'utf-8') , {}));
});

/*Renders the necessary partial for completing orders with card.*/
$(document).on("click", "#card", function () {
	/*Sets the card flag to true to denote a card transaction is in process*/
  card_flag = 1;
	/*Renders the html file necessary to handle card transactions*/
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/card.html', 'utf-8') , {}));
});

/*Renders the necessary partial for completing orders with cash and cards*/
$(document).on("click", "#c_and_c", function () {
  console.log("Cash and card");
});

/*Renders the necessary partial for completing orders with multiple cards.*/
$(document).on("click", "#m_card", function () {
  console.log("Multi card");
});

/*NOTE: BEGIN CARD TRANSACTION CODE*/
$(document).on("click", "#swipe_sim", function() {
	/*Set the cancel flag to prevent any cancellations once the card is in the processing stages*/
  cancel_flag = 0;
	/*Only allows the swipe button to render the process.html file if the card option is the selected pay option*/
  if(card_flag)
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , {}));
	setTimeout(function() {
		$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
	}, 3000);
});
