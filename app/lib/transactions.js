const guid = require('guid')

// NOTE mongoose IS DIFFERENT THAN TransactionConnection and should not be saved

/*second we create a schema of how our data will be modeled*/
var Cash = new mongoose.Schema({
    guid        : { type : String, required : true } /*shared*/

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

    /*This is the "body" of some sort*/
    cashes      : [ CashTransaction ],
    cards       : [ CardTransaction ],
    items       : [ ItemContainer ]
});

transactionSchema.methods.createGUID = function(callback){
    this.guid = guid.raw();
}
transactionSchema.methods.populateItems = function(callback){

}

transactionSchema.methods.createCashTransaction = function(callback){

}
transactionSchema.methods.createCardTransaction = function(callback){

}


/*now we create an actual model we can use to communicatte with our javascript*/

var Transaction = TransactionConnection.model('Transaction', transactionSchema);




/*sample code for john*/
function createCashTransaction(guid){

}

function createCardTransaction(guid){

}






/*
    transaction connection is defined within the backend.js file
    and it is its own seperate database with a dedicated connection
    to ONLY transactions
*/

module.exports = Transaction
