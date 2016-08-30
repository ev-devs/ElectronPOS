/***********************PRINT.JS***********************/
$(document).on("click", "#yes-receipt", function() {
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
  printTheOrder(cur_transaction.guid)
  void_order(1);
});

$(document).on("click", "#no-receipt", function() {
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/completed.html', 'utf-8') , {}));
  void_order(1);
});

function print_init() {
  $("#cancel").removeAttr("style");
  $("#confirm").removeAttr("style");
  previous_flag = 0;
  confirm_flag = 0;
  cancel_flag = 0;
  cash_flag = 0;
  card_flag = 0;
  console.log("===============BEFORE:");
  console.log(cur_transaction);
  cur_transaction.save(function(err){
    if (err){
      console.log("Error in saving new transaction", err)
      Materialize.toast(err, 10000)
      console.log(cur_transaction)
    }
    else {
      console.log("New transaction saved!")
    }
  });
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/print.html', 'utf-8') , {}));
  console.log("===============AFTER:");
  console.log(cur_transaction);
}


// this is what will do the printing
function printTheOrder(guid){
    Transaction.findOne({guid : guid}, function(err, transaction){
        if (err){
            console.log(err)
            Materialize.toast(err, 10000)
        }
        else {

            let stream = fs.createWriteStream( __dirname + '/../../../kprint/reciept.txt', {
                flags : 'w', encoding : 'utf-8'
            })
            stream.on('error', function(error){
                Materialize.toast(error, 10000)
            })

            /*This is the header*/
            stream.write( "date, "      + transaction.dateCreated   + '\n')
            stream.write( "guid, "      + transaction.guid          + '\n')

            /*This is the lower header*/
            stream.write( "location, "  + transaction.location      + '\n')
            stream.write( 'leader, '    + transaction.platinum      + '\n')

            /*This is the */
            stream.write( "subtotal, "  + transaction.subtotal      + '\n')
            stream.write( "tax, "       + transaction.tax           + '\n')
            stream.write( "total,"      + transaction.total         + '\n')
            stream.write( "payments, "  + transaction.payments      + '\n')
            stream.end()


            //fs.appendFileSync( __dirname + '/../../../kprint/reciept.txt' , transaction.payments + '\n')

            /*we need to iterate through this*/
            let cashes      = transaction.cashes
            let cards       = transaction.cards
            let items       = transaction.items

            for (let i = 0; i < cashes.length; i++){
                console.log(cashes[i].tendered)
            }
            for (let i = 0; i < cards.length; i++){
                console.log(cards[i].amount)
            }
            for (let i = 0; i < items.length; i++){
                console.log(items[i])
            }

        }
    })
}
