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
      ay = transactions;
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

var query;
$(document).on("click", ".void-all", function() {
  $('#voidModal2').openModal({
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
  });
  query = $(this).attr("id");
  console.log(query);
});

var all_voided = true;
var all_done = [];
$(document).on("click", ".confirm-void", function() {
  current_platinum = "NONE";
  confirm_flag = 0;
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/process.html', 'utf-8') , { current: "Voiding" }));
  if($(this).attr("id") == "confirm-void-one") {
    var guid = elem_id.substring(0, elem_id.search("_"));
    var j = Number(elem_id.substring(elem_id.search("_") + 1, elem_id.length));
    Transaction.findOne({ guid : guid }, function(err, transaction_) {
      console.log(transaction_.cards[j].transId);
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
            console.log(obj.transId)
            $("#" + elem_id).remove();
            transaction_.cards[j].voidable = false;
            transaction_.cards[j].voided = true;
            transaction_.save(function(err){
                if (err){
                    console.log("Error in updating Trans " + err)
                }
                else {
                    console.log("Updated Existing Trans")
                    $("#cancel").removeAttr("style");
                    $("#confirm").removeAttr("style");
                    /*Sets the confirm flag back to one to denote that a normal completion can happen*/
                    $("#cancel").text("Cancel");
                    $("#confirm").text("Confirm");
                    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
                }
            });
          }
          else {
              Materialize.toast("There was an error getting a response from the server", 3000)
              setTimeout(function() {
                $("#cancel").css("background-color", "red");
                $("#confirm").css("background-color", "green");
                $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/' + current_page, 'utf-8') , {}));
              }, 3000)
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
      if(err) {
        console.log("ERRORS");
      }
      else if(transaction_) {
      for(var i = 0; i < transaction_.cards.length; i++) {
          var newTrans = new transaction();
          console.log(transaction_.cards[i].transId);
          newTrans.voidTransaction({
              transId  : transaction_.cards[i].transId
          })
          .then(function(obj){
            all_done.push("voided");
            if (!obj.error) {
              console.log(obj.transMessage)
              console.log("Transaction Id:", obj.transId)

              if(all_done.length ==  transaction_.cards.length && all_voided) {
                for(var x = 0; x < transaction_.cards.length; x++) {
                  console.log(transaction_.cards[x]);
                  transaction_.cards[x].voidable = false;
                  transaction_.cards[x].voided = true;
                }
                transaction_.save(function(err){
                    if (err){
                        console.log("Error in updating Trans " + err)
                    }
                    else {
                        console.log("Updated Existing Trans")
                        console.log(all_done.length);
                        console.log(transaction_.cards.length);
                    }
                });
                $("#cancel").removeAttr("style");
                $("#confirm").removeAttr("style");
                /*Sets the confirm flag back to one to denote that a normal completion can happen*/
                $("#cancel").text("Cancel");
                $("#confirm").text("Confirm");
                $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/select_platinums.html', 'utf-8') , {"A" : 0}));
              }
            }
            else {
                console.log(obj.transMessage)
                console.log("Error Code:", obj.transErrorCode)
                console.log("Error Text:", obj.transErrorText)
                all_voided = false;
                all_done.push("not voided");
            }
          });
        }
      }
    });
  }
});

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
