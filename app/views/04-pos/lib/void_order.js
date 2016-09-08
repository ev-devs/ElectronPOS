var ay = [];
$("#prev-transactions").click(function() {
  if(can_end_session == 1) {
    current_platinum = "NON";
    confirm_flag = 1;
    current_page = "prev_trans.html";
    prev_page = "select_platinums.html";
    $("#cancel").css("background-color", "red");
    $("#cancel").text("Back");
    refocus();
    Transaction.find({}, function(err, transactions) {
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/prev_trans.html', 'utf-8') , { transactions : transactions }));
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


var elem_id;
$(document).on("click", ".transaction", function() {
   elem_id = $(this).attr("id");
   var guid = elem_id.substring(0, elem_id.search("_"));
   var j = Number(elem_id.substring(elem_id.search("_") + 1, elem_id.length));
   current_page = "indv_trans.html";
   prev_page = "prev_trans.html";
   var x = []
   Transaction.findOne({guid : guid}, function(err, _transaction) {
      x.push(_transaction);
      x.push(j);
      $("#confirm").text("Void");
      $("#cancel").text("Back");
      $("#confirm").css("background-color", "green");
      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/indv_trans.html', 'utf-8') , { transaction : x }));
   });
});

//var query;
$(document).on("click", ".void-all", function() {
  $('#voidModal2').openModal({
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
  });
  //query = $(this).attr("id");
});
/*
$(document).on("click", ".confirm-void", function() {
  current_platinum = "NONE";
  confirm_flag = 0;
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , { current: "Voiding" }));
  var guid = elem_id.substring(0, elem_id.search("_"));
  var j = Number(elem_id.substring(elem_id.search("_") + 1, elem_id.length));
  if($(this).attr("id") == "confirm-void-one") {
    Transaction.findOne({ guid : guid }, function(err, transaction_) {
      if(err) {
        console.log("ERRORS");
      }
      else if(transaction_) {
        var newTrans = new transaction();
        newTrans.voidTransaction({
            transId  : transaction_.cards[j].transId
        }).then(function(obj){
          if (!obj.error) {
            console.log(obj.transMessage)
            console.log("Transaction Id:", obj.transId)
            $("#" + elem_id).remove();
            transaction_.cards[j].voidable = false;
            transaction_.cards[j].voided = true;
            transaction_.save(function(err){
                if (err){
                    console.log("Error in updating Trans " + err)
                }
                else {
                    console.log("Updated Existing Trans")
                    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
                }
            });
          }
          else {
              console.log(obj.transMessage)
              console.log("Error Code:", obj.transErrorCode)
              console.log("Error Text:", obj.transErrorText)
          }
        });
      }
      else if(!transaction_){
        console.log("transaction does not exist");
      }
    });
  }
  else if($(this).attr("id") == "confirm-void-all") {
    Transaction.findOne({ guid : query }, function(err, transaction_) {

      for(var i = 0; i < transaction.cards.length; i++) {

        if(err) {
          console.log("ERRORS");
        }
        else if(transaction_) {
          var newTrans = new transaction();
          newTrans.voidTransaction({
              transId  : transaction_.cards[i].transId
          })
          .then(function(obj){
            if (!obj.error) {
              console.log(obj.transMessage)
              console.log("Transaction Id:", obj.transId)
              $("#" + elem_id).remove();
              transaction_.cards[i].voidable = false;
              transaction_.cards[i].voided = true;
              transaction_.save(function(err){
                  if (err){
                      console.log("Error in updating Trans " + err)
                  }
                  else {
                      console.log("Updated Existing Trans")
                      if(i ==  transaction_.cards.length - 1)
                      $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
                  }
              });
            }
            else {
                console.log(obj.transMessage)
                console.log("Error Code:", obj.transErrorCode)
                console.log("Error Text:", obj.transErrorText)
            }
          });
        }
      }
    });
  }
}*/
function update_transaction_db() {
  Transaction.find({}, function(err, transactions_) {
    for(var i = 0; i < transactions_.length; i++) {
      for(var j = 0; j < transactions_[i].cards.length; j++) {
        var cur_date = new Date().getTime();
        var deadline = transactions_[i].cards[j].dateCreated.getTime() + 86400000;
        if(cur_date > deadline && transactions_[i].cards[j].voidable) {
          transactions_[i].cards[j].voidable = false;;
          transactions_[i].save(function(err){
              if (err){
                  console.log("Error in updating Trans " + err)
              }
              else {
                  console.log("Updated Existing Trans")
              }
          });
        }
      }
    }
  });
}
