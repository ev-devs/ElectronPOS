$("#prev-transactions").click(function() {
  if(can_end_session == 1) {
    Transaction.find({}, function(err, _transactions) {
       $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/prev_trans.html', 'utf-8') , {transactions : _transactions}));
    });
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

$(document).on("click", ".transaction", function() {

});
