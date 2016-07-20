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

$('.begin-session').click(function(event){
    // event is a click event just FYI
    if (noErrors()){
        
    }

});

/*returns true if no errors. False if error is detected*/
function noErrors(){

    var return_value = true;

    if($('#first_name').val() == ""){
        Materialize.toast('Please Input A First Name', 4000)
        return_value = false
    }
    if ($('#last_name').val() == ""){
        Materialize.toast('Please Input A Last Name', 4000)
        return_value = false
    }
    if ($('#ibo_number').val() == ""){
        Materialize.toast('Please Input An IBO Number', 4000)
        return_value = false
    }
    return return_value
}

function iboExists() {
    iboSession.findOne({
        firstname   : $('#first_name').val(),
        lastname    : $('#last_name').val(),
        ibonumber   : $('#ibo_number').val()
    }. function(err, ibo){
        if (err){
            return console.log(err)
        }
        else {

        }
    })
}
