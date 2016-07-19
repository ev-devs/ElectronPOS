/*First we require our mongoose session*/
var mongoose = require('mongoose');

/*second we establish a connection with our database*/
mongoose.connect('mongodb://localhost/ibosessions', function(err) {
    if (err){
        $('#modal1').openModal();
        return console.log(err)
    }
    else {
        console.log('we successfully connected to mongodb://localhost/ibosessions');
    }
});

/*second we create a schema of how our data will be modeled*/
var iboSessionSchema = new mongoose.Schema({

    firstname        : { type : String },
    lastname         : { type : String },
    ibonumber        : { type : String },
    timestart        : { type : Date },
    endtime          : { type : Date },
    createdat        : { type : Date, default: Date.now },
    transactions     : { type : Number, default : 0 },
    numberofsessions : { type : Number, default : 0 }

});

/*now we create an actual model we can use to communicatte with our javascript*/
var iboSession = mongoose.model('Session', iboSessionSchema);

iboSession.find({}, function(err, sessions){
    console.log(sessions)
});

$('')
