const mongoose = require('mongoose')

var Item =  new mongoose.Schema({
    evid        : { type : String, required : true },
    barcode     : { type : String, required : true },
    title       : { type : String, required : true },
    isticket    : { type : String, required : true },
    prefix      : { type : String, required : true },
    price       : { type : String, required : true },
    tax         : { type : String, required : true }
});

var ItemTrans = TransactionConnection.model('ItemTrans', Item );
module.exports = ItemTrans
