$(document).on("click", "#return-items", function() {
  if(can_end_session == 1) {
    current_platinum = "NON";
    confirm_flag = 1;
    scan_flag = 1;
    current_page = "return.html";
    prev_page = "handle_order.html";
    $("#cancel").css("background-color", "red");
    $("#cancel").text("Back");
    refocus();
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/return.html', 'utf-8') , {}));
  }
  else {
    $('#modal8').openModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
  }
});
