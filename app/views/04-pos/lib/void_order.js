var transactions = [];
$("#prev-transactions").click(function() {
  if(can_end_session == 1) {
    current_platinum = "NON";
    confirm_flag = 1;
    Transaction.find({}, function(err, _transactions) {
       var transactions = _transactions;
       update_transaction_db(_transactions);
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
   $('#voidModal3').openModal({
     dismissible: true, // Modal can be dismissed by clicking outside of the modal
     opacity: .5, // Opacity of modal background
     in_duration: 300, // Transition in duration
     out_duration: 200, // Transition out duration
   });
});

$(document).on("click", "#confirm-void", function() {
  current_platinum = "NONE";
  confirm_flag = 0;
  var trans_id = elem_id.substring(0, elem_id.search("_"));
  var trans_guid = elem_id.substring(elem_id.search("_") + 1, elem_id.length)
  console.log(trans_guid);
  var newTrans = new transaction();
  newTrans.voidTransaction({
      transId  : trans_id
  }).then(function(obj){

      if (!obj.error){
          console.log(obj.transMessage)
          console.log("Transaction Id:", obj.transId)
          $("#" + elem_id).remove();
          /*Begin transaction search*/
          Transaction.findOne( { guid : trans_guid }, function(err, trans){
            if (err){
                console.log( "Error in finding a transaction " +  err)
            }
            else {
              console.log(trans)
              trans.cards[0].voidable = false;
              trans.cards[0].voided = true;
              trans.save(function(err){
                  if (err){
                      console.log("Error in updating Trans " + err)
                  }
                  else {
                      console.log("Updated Existing Trans")
                  }
              })
            }
          });
          /*End Transaction search*/
      }
      else {
          console.log(obj.transMessage)
          console.log("Error Code:", obj.transErrorCode)
          console.log("Error Text:", obj.transErrorText)
      }
      console.log('\n')
  })
});

function update_transaction_db(transactions_) {
  var cur_date = Date.parse(new Date());
  for(var i = 0; i < transactions_.length; i++) {
    for(var j = 0; j < transactions_[i].cards.length; j++) {
      //var past_date = transactions_[i].cards[j].dateCreated.parse();
      //console.log(cur_date - past_date);
      var deadline = transactions_[i].cards[j].dateCreated;
      deadline = deadline.setDate(deadline.getDate() + 1);
      if(cur_date >= deadline) {
        /*Begin transaction search*/
        Transaction.findOne( { guid : transactions_[i].cards[j].guid }, function(err, trans){
          if (err){
              console.log( "Error in finding a transaction " +  err)
          }
          else {
            console.log(trans)
            trans.cards[0].voidable = false;
            trans.save(function(err){
                if (err){
                    console.log("Error in updating Trans " + err)
                }
                else {
                    console.log("Updated Existing Trans")
                }
            })
            console.log("FOUND");
          }
        });
        /*End Transaction search*/
      }
    }
  }
}
