/*second we create a schema of how our data will be modeled*/
var Cash = new mongoose.Schema({
    guid        : { type : String, required : true }
    tendered    : { type : Number, required : true },
    change      : { type : Number, required : true },
})

var Card = new mongoose.Schema({
    amount      : { type : Number, required : true },
    authCode    : { type : String, required : true },
    transId     : { type : String, required : true },
    message     : { type : String, required : true },
    cardType    : { type : String, required : true }
})

var Item =  new mongoose.Schema({

})



var transactionSchema = new mongoose.Schema({

    items       : [ Item ],
    subtotal    : { type : Number, required : true },
    tax         : { type : Number, required : true },
    total       : { type : Number, required : true },
    cashes      : [ Cash ],
    cards       : [ Card ]

});


/*now we create an actual model we can use to communicatte with our javascript*/

var Transaction = TransactionConnection.model('Transaction', transactionSchema);

/*
    transaction connection is defined within the backend.js file
    and it is its own seperate database with a dedicated connection
    to ONLY transactions
*/

module.exports = Transaction
