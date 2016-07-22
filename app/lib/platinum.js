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
var Platinum = mongoose.model('Platinum', platinumSchema);

module.exports = Platinum
