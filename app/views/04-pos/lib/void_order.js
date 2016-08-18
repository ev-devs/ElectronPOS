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


var trans_Id;
$(document).on("click", ".transaction", function() {
   trans_Id = $(this).attr("id");
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
  var newTrans = new transaction();
  //newTrans.transId = trans_Id;
  newTrans.voidTransaction({
      transId  : trans_Id
  }).then(function(obj){

      if (!obj.error){
          console.log(obj.transMessage)
          console.log("Transaction Id:", obj.transId)
          $("#" + trans_Id).remove();
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
  var cur_date = new Date();
  cur_date = cur_date.getHours();
  for(var i = 0; i < transactions_.length; i++) {
    for(var j = 0; j < transactions_[i].cards.length; j++) {
      if(cur_date - transactions_[i].cards[j].dateCreated.getHours() != 0) {
        /*Begin transaction search*/
        Transaction.findOne( { guid : transactions_[i].cards[j].guid }, function(err, trans){
          if (err){
              console.log( "Error in finding a transaction " +  err)
          }
          else {
            trans.cards[j].voidable = false;
            //if (trans){
            trans.save(function(err){
                if (err){
                    console.log("Error in updating platinum " + err)
                    reject(err)
                }
                else {
                    console.log("Updated Existing Trans")
                    resolve(1)
                }
            })
            console.log("FOUND");
            //}
          }
        })
        /*End Transaction search*/
      }
    }
  }
}
