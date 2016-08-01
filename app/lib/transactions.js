/*second we create a schema of how our data will be modeled*/
var transactionSchema = new mongoose.Schema({
    _type          : { type : String },
    price          : { type : String },
    transId        : { type : String, unique : true },
    message        : { type : String },
    authCode       : { type : String }

});

/*now we create an actual model we can use to communicatte with our javascript*/
var Transaction = TransactionConnection.model('Transaction', transactionSchema);
/*
    PlatinumConnection is defined within the backend.js file
    and it is its own seperate database with a dedicated connection
    to ONLY platinums
*/

module.exports = Transaction
