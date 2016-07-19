document.addEventListener('refocus', function(e) {
  $("#barcode").focus();
})
function refocus() {
  var event = new CustomEvent('refocus');
  document.dispatchEvent(event);
}

$(".keyboard").keyboard({
  restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
  preventPaste : true,  // prevent ctrl-v and right click
  autoAccept : true,
  layout: "num"
});

/*BEGIN SEARCH INVENTORY CODE*/
$("#search").change(function() {
  console.log("Changed");
});

/*BEGIN CANCEL ORDER CODE*/
$("#cancel").click(function() {
  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1)
    $('#modal2').openModal();
});

/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE (can be put into cash.html if wanted)*/ /*MAY NEED TO GO IN BACKEND.JS*/
$(document).on("change", "#tendered", function() {
  if($(this).val() >= total) {
    var change = $(this).val() - accounting.formatNumber(total, 2, ",");
    $("#change").text("$" + accounting.formatNumber(change, 2, ","));
  }
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Render platinums list FIX*/
}
