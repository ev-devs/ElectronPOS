const guid      = require('node-uuid')
const mongoose  = require('mongoose')
const ItemTrans = require('./ItemTrans.js').schema
const CardTrans = require('./CardTrans.js').schema
const CashTrans = require('./CashTrans.js').schema


// NOTE mongoose IS DIFFERENT THAN TransactionConnection and should not be saved anywhere

/*This is a "master" transaction that contains sub transactions of cash and card*/
var transactionSchema = new mongoose.Schema({
    /*Think of this as a "Header" of sorts*/
    guid        : { type : String, required : true },
    platinum    : { type : String, required : true },
    dateCreated        : { type : Date  , required : true },
    location    : { type : String, required : true },
    subtotal    : { type : Number, required : true },
    tax         : { type : Number, required : true },
    total       : { type : Number, required : true },
    payments    : { type : Number, required : true },

    /*This is the "body" of some sort*/
    cashes      : [ CashTrans ],
    cards       : [ CardTrans ],
    items       : [ ItemTrans ]

});

/*This creates the GUID*/

transactionSchema.methods.hello =  function() {
    alert('hello')
    console.log('hello')
}
transactionSchema.methods.createGUID = function(){
    this.guid = guid.v4();
    return this
}
transactionSchema.methods.getGUID = function(){
    return this.guid
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
