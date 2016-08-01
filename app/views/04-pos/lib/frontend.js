document.addEventListener('refocus', function(e) {
  $("#barcode").focus();
})

function refocus() {
  var event = new CustomEvent('refocus');
  document.dispatchEvent(event);
}


/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE */
$(document).on( "jpress", "#tendered", function() {
  if($(this).val() >= total) {
    var change = $(this).val() - accounting.formatNumber(total, 2, ",").replace(/,/g, "");
    $("#change").text("$" + accounting.formatNumber(change, 2, ","));
  }
  else
    $("#change").text(0);
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Render platinums list FIX*/
}


 $(".button-collapse").sideNav();
