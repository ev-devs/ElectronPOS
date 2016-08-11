const guid = require('guid')
const mongoose = require('mongoose')

// NOTE mongoose IS DIFFERENT THAN TransactionConnection and should not be saved

/*second we create a schema of how our data will be modeled*/
var Cash = new mongoose.Schema({
    guid        : { type : String, required : true }, /*shared*/

    tendered    : { type : Number, required : true },
    change      : { type : Number, required : true },
})
var CashTransaction = mongoose.model('CashTransaction', Cash);


var Card = new mongoose.Schema({
    guid        : { type : String, required : true }, /*shared*/

    amount      : { type : Number, required : true },
    authCode    : { type : String, required : true },
    transId     : { type : String, required : true },
    message     : { type : String, required : true },
    cardType    : { type : String, required : true }
})
var CardTransaction = mongoose.model('CardTransaction', Card);


var Item =  new mongoose.Schema({
    evid        : { type : String, required : true },
    barcode     : { type : String, required : true },
    title       : { type : String, required : true },
    isticket    : { type : String, required : true },
    prefix      : { type : String, required : true },
    price       : { type : String, required : true },
    tax         : { type : String, required : true }
});
var ItemContainer = mongoose.model('ItemContainer', Item);


/*This is a "master" transaction that contains sub transactions of cash and card*/
var transactionSchema = new mongoose.Schema({
    /*Think of this as a "Header" of sorts*/
    guid        : { type : String, required : true },
    platinum    : { type : String, required : true },
    date        : { type : Date  , required : true },
    location    : { type : String, required : true },
    subtotal    : { type : Number, required : true },
    tax         : { type : Number, required : true },
    total       : { type : Number, required : true },
    payments    : { type : Number, required : true },

    /*This is the "body" of some sort*/
    cashes      : [ CashTransaction ],
    cards       : [ CardTransaction ],
    items       : [ ItemContainer ]

});

/*This creates the GUID*/
transactionSchema.methods.createGUID = function(callback){
    this.guid = guid.raw();
    return this
}
transactionSchema.methods.populateItems = function(callback){
    callback(this)
    return this
}

transactionSchema.methods.createCashTransaction = function(callback){
    callback(this)
    return this
}
transactionSchema.methods.createCardTransaction = function(callback){
    callback(this)
    return this
}


/*now we create an actual model we can use to communicatte with our javascript*/

var Transaction = TransactionConnection.model('Transaction', transactionSchema);
/*
    transaction connection is defined within the backend.js file
    and it is its own seperate database with a dedicated connection
    to ONLY transactions
*/

module.exports = Transaction

/*############################### THIS IS WHERE THE EXAMPLES START*/

var newTransaction = new Transaction();
newTransaction.createGUID() // this creates the GUID

newTransaction.populateItems(function(transaction){
    // populate the items right here
    // you also have access to the entire model

    transaction.guid        //=> this is the guid DO NOT MODIFY
    transaction.platinum    //=> Here you should modify the platinum name
    transaction.date        //=> Using the date.now() methd you should be fine
    transaction.location    //=> this can be reached from the main.js process via ipc
    transaction.subtotal    //=> this is the raw subtotal without taxes
    transaction.tax         //=> this can be calculated via a function with the data we get from the event
    transaction.total       //=> this is just adding subtotal and tax together
    transaction.payments    //=> the amount of payments that will be made. At least 1

    transaction.cashes      //=> this is an array of cash transaction
    transaction.cards       //=> this is an array of card transactions
    transaction.items       //=> this is where we need to create the items

    for (i; i < 100; i++){
        // populate the items array
        // calculate tax per item
        // update subtotal
        // update tax total
        // update overall total
    }

})

newTransaction.createCashTransaction(function(transaction){

    var newCashTransaction  = new CashTransaction()
    transaction.tendered = "Some amount of money"
    transaction.change   = "another amount of money"

    transaction.cashes.push(/*a new cash transaction here*/)

    /*after success+*/
    transaction.payments++
})

newTransaction.createCardTransaction(function(transaction){

    var newCardTransaction = new CardTransaction()
    var response = MakeCallToAuthNetAPI()

    if (response.path.to.error){
        // handle errors and display in UI
    }

    transaction.amount   = "some amount"
    transaction.authCode = response.some.path.to.the.authCode
    transaction.transId  = response.some.path.to.the.transId
    transaction.message  = response.some.path.to.the.message
    transaction.cardType = functionCallToSeeWhatTypeOfCard();

    transaction.cards.push(/*a new cash transaction here*/)

    /*after success+*/
     transaction.payments++
})
