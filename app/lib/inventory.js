/*second we create a schema of how our data will be modeled*/
var inventorySchema = new mongoose.Schema({

    id          : { type : String  , unique : true},
    title       : { type : String  },
    barcode     : { type : String  },
    price       : { type : Number  },
    prefix      : { type : String  },
    isTicket    : { type : Boolean }

});

/*now we create an actual model we can use to communicatte with our javascript*/
var Inventory = InventoryConnection.model('Inventory', inventorySchema);

/*  InventoryConnection is accessed through the backend.js file. It is its own
    connection to its OWN database
*/

module.exports = Inventory
