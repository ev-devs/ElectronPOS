const mongoose = require('mongoose')

// NOTE mongoose IS DIFFERENT THAN TransactionConnection and should not be saved

/*second we create a schema of how our data will be modeled*/
var Cash = new mongoose.Schema({
    guid        : { type : String, required : true }, /*shared*/
    tendered    : { type : Number, required : true },
    change      : { type : Number, required : true },
    dateCreated : { type : Date  , required : true }
})

var CashTrans = TransactionConnection.model('CashTrans', Cash);
module.exports = CashTrans
