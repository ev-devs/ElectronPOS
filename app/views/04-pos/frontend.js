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
  autoAccept : true/*,
  layout: "num"*/
});

/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE */
$(document).on("change", "#tendered", function() {
  if($(this).val() >= total) {
    var change = $(this).val() - accounting.formatNumber(total, 2, ",");
    console.log(change);
    $("#change").text("$" + accounting.formatNumber(change, 2, ","));
  }
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Render platinums list FIX*/
}

$(document).on("click",  ".item", function() {
  $("#selected_item").text($($(this).children()[0]).text().trim());
  $("#selected_item").removeClass();
  $("#selected_item").addClass($($(this).children()[0]).attr("id"));
	$('#modal3').openModal({
		dismissible: false, // Modal can be dismissed by clicking outside of the modal
		opacity: .5, // Opacity of modal background
		in_duration: 300, // Transition in duration
		out_duration: 200, // Transition out duration
	});
});

 $(".button-collapse").sideNav();
