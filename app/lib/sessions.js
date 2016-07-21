/*second we create a schema of how our data will be modeled*/
var iboSessionSchema = new mongoose.Schema({

    /*this is updated upon NEW session creation*/
    firstname        : { type : String },
    lastname         : { type : String },
    ibonumber        : { type : String },
    timestart        : { type : Date },
    created          : { type : Date, default: Date.now },
    updated          : { type : Date },
    /*This is updated during and after session ends*/
    endtime          : { type : Date },
    transactions     : { type : Number, default : 0 },
    numberofsessions : { type : Number, default : 0 },
    totaltime        : { type : Date },
    elapsedtime      : { type : Date }

});

/*now we create an actual model we can use to communicatte with our javascript*/
var Session = mongoose.model('Session', iboSessionSchema);

module.exports = Session
