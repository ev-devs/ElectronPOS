/*second we create a schema of how our data will be modeled*/
var platinumSchema = new mongoose.Schema({

    id          : { type : String, unique : true },
    firstname   : { type : String  },
    lastname    : { type : String  },
    active      : { type : Boolean },
    ibonumber   : { type : String  },
    rt          : { type : Boolean },
    pnl         : { type : Number  },
    admin       : { type : Boolean },
    email       : { type : String }

});

/*now we create an actual model we can use to communicatte with our javascript*/
var Platinum = PlatinumConnection.model('Platinum', platinumSchema);
/*
    PlatinumConnection is defined within the backend.js file
    and it is its own seperate database with a dedicated connection
    to ONLY platinums
*/

module.exports = Platinum
