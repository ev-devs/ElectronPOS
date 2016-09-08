const mongoose = require('mongoose')

var Card = new mongoose.Schema({
    guid        : { type : String, required : true }, /*shared*/
    card_holder : { type : String, required : true },
    digits      : { type : String, required : true },
    amount      : { type : Number, required : true },
    authCode    : { type : String, required : true },
    transId     : { type : String, required : true },
    message     : { type : String, required : true },
    cardType    : { type : String, required : true },
    dateCreated : { type : Date,   required : true },
    voidable    : { type : Boolean, required : true },
    voided      : { type : Boolean, required : true }
})

var CardTrans = TransactionConnection.model('CardTrans', Card);
module.exports = CardTrans
