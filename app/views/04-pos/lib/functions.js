/***********************FUNCTIONS.JS***********************/
function update_price(operation, quantity, placement, confirmed) {
    if(!confirmed) {
        /*Update the global quantities of subtotal, tax, and total*/
        if(operation == '+')
            subtotal+=((item_list[placement].price * quantity));
        else if(operation == '-')
            subtotal-=((item_list[placement].price * quantity));
        else if(operation == '~')
            subtotal-=quantity;
        $("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",") );
        tax = subtotal * tax_rate;
        $("#tax").text("$" + accounting.formatNumber(tax, 2, ",") );
        total = subtotal + tax;
        $("#total").text("$" + accounting.formatNumber(total, 2, ",") );
    }
    else if(confirmed) {
        total-=quantity;
        $("#total").text("$" + accounting.formatNumber(total, 2, ",") );
    }
}

/*********************************************NOTE: BEGIN VOID ORDER CODE*********************************************/
/*A function that voids an order. Used to cancel orders and void orders aftercash or card has been paid*/
function void_order(full_void) {
    can_end_session = 1;
    confirm_flag = 0;
    cancel_flag = 0;
    /*Cash flag is set to 0 to denote the end of a cash transaction*/
    cash_flag = 0;
    card_flag = 0;
    scan_flag = 0;
    ticket_flag = 0;
    swipe_flag = 0;
    current_ticket = [-1, -1, "CODE"];
    update_transaction_db();
    if(full_void == 1) {
      item_list.splice(0, item_list.length);/*Empties the item list*/
          /*Empties the left side*/
      $("#sale_list tbody").empty();
          /*Empties the subtotal and total*/
      update_price('~', subtotal, 0, 0);
      $("#cancel").removeAttr("style");
      $("#confirm").removeAttr("style");
      /*Sets the confirm flag back to one to denote that a normal completion can happen*/
      $("#cancel").text("Cancel");
      $("#confirm").text("Confirm");
      current_platinum = "NONE";
      previous_page = "1";
      current_page = "2";
      cur_transaction = {};
      user_input = "";
      /*searched_leaders = []; //modified array of searched leaders
      platinums_stack = [];*/
      delete_flag = 0;
      //setTimeout(function() {
          $('#enter-platinum').remove()
          $('#enter-platinum-modal').remove()
          $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
      //}, 1500);
    }
}

function colorfy() {
    /*Sets the cancel and confirm buttons to red and green respectively*/
    $("#cancel").css("background-color", "red");
    $("#confirm").css("background-color", "green");
}

/*********************************************BEGIN ERROR MODAL CODE*********************************************/
function error_platinum() {
    $('#modal4').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
    });
}

function error_in_used() {
    $('#modal5').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
    });
}
