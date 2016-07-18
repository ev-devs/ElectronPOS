/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE (can be put into cash.html if wanted)*/ /*MAY NEED TO GO IN BACKEND.JS*/
$(document).on("change", "#tendered", function() {
  if($(this).val() >= total)
    $("#change").text("$" + accounting.formatNumber(Number($(this).val()) - total, 2, ",").toString())
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Voids the order to reset the variables in anticipation for a new  transaction*/
	void_order();
	/*Render platinums list FIX*/
}

/*A function that voids an order. Used to cancel orders and void orders aftercash or card has been paid*/
function void_order() {
    item_list.splice(0, item_list.length);/*Empties the item list*/
		/*Empties the left side*/
    $("#sale_list tbody").empty();
		/*Empties the subtotal and total*/
    subtotal = 0;
    tax = 0;
    total = 0;
    $("#subtotal").text("$" + subtotal.toString());
    $("#tax").text("$"+tax.toString());
    $("#total").text("$"+total.toString());

}
