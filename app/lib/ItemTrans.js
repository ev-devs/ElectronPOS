const mongoose = require('mongoose')

var Item =  new mongoose.Schema({
    guid        : { type : String, required : true },
    evid        : { type : String, required : true },
    barcode     : { type : String, required : true },
    title       : { type : String, required : true },
    isticket    : { type : String, required : true },
    prefix      : { type : String }, // not all items have a prefix, and some prefix's are null
    price       : { type : String, required : true },
    tax         : { type : String, required : true }
});

var ItemTrans = TransactionConnection.model('ItemTrans', Item );
module.exports = ItemTrans
