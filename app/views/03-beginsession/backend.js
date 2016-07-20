/*First we require our mongoose session*/
var mongoose = require('mongoose');

/*This will be accessed throughout our program for session interaction*/
var iboSession = require('../../lib/sessions.js')

/*After we capture session, we send it to the main process*/
const ipc = require('electron').ipcRenderer


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

$('.begin-session').click(function(event){
    // event is a click event just FYI
    if (noErrors()){
        if (iboSessionExists()){
            // session is udated in function above so we're good
        }
        else {
            // create new session
            createIboSession()
        }
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

function iboSessionExists() {
    iboSession.findOne({
        firstname   : $('#first_name').val(),
        lastname    : $('#last_name').val(),
        ibonumber   : $('#ibo_number').val()
    }, function(err, session){
        if (err) {
            // this is a potential bug in the code, but for now it will work
            return console.log(err)
        }

        if (session){

            session.updated = Date.now();
            session.numberofsessions = session.numberofsessions + 1
        }
        else {
            return false

        }
    })
}


function createIboSession(){
    var newSession = new iboSession({
        firstname          : $('#first_name'),
        lastname           : $('#last_name'),
        ibonumber          : $('#ibo_number'),
        timestart          : Date.now(),
        numberofsessions   : 1,
        updated            : Date.now()
    });
    newSession.save(function(err, session){
        if (err){
            //console.log(session)
            console.log(err)
            Materialize.toast( err , 4000)
        }
        else {

            ipc.send('ibo-session-messsage', session)
        }
    })
}


ipc.on('ibo-session-reply', function (event, arg) {
  const message = `Asynchronous message reply: ${arg}`
  console.log(message)
  // Here is where we now send our user to the next page

});
