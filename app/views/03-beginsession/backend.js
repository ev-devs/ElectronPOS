/*First we require our mongoose session*/
var mongoose = require('mongoose');

/*This will be accessed throughout our program for session interaction*/
var Session = require('../../lib/sessions.js');

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
    if ( noErrors() ){

        updateOrCreateSession();
    }

});

/*returns true if no errors. False if error is detected*/
function noErrors(){

    /*we assume there are no errors*/
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
};

function updateOrCreateSession() {

    Session.find({
        firstname   : $('#first_name').val().toString(),
        lastname    : $('#last_name').val().toString(),
        ibonumber   : $('#ibo_number').val().toString()
    }).
    limit(1).
    exec(function(err, session){
        if (err){
            console.log("ERROR IS " +  err)
        }
        else {

            console.log( "SESSION CURRENTLY IS " +  session)
            console.log(Object.keys(session).length)

            /*If the session is empty, then create a new one*/
            if (! (Object.keys(session).length !== 0 && session.constructor !== Object ) ){

                createIboSession()
            }
            else {

                session[0].timestart = Date.now()
                session[0].updated = Date.now()
                session[0].numberofsessions += 1

                session[0].save(function(err){
                    if (err){
                        console.log(err)
                    }
                    else {
                        console.log('UPDATED SESSION IS ' + session)
                        ipc.send('ibo-session-message', session[0])
                    }
                })



            }
        }
    })

};

function createIboSession(){

    var newSession = new Session({
        firstname          : $('#first_name').val(),
        lastname           : $('#last_name').val(),
        ibonumber          : $('#ibo_number').val(),
        timestart          : Date.now(),
        numberofsessions   : 1,
        updated            : Date.now()
    });

    newSession.save(function(err, session){
        if (err){
            //console.log(session)
            console.log(err)
            Materialize.toast( err , 10000000)
        }
        else {
            // once the new session is created we send it to the main process
            console.log('session is saved ' + session)
            ipc.send('ibo-session-message', session)
        }
    })
};

ipc.on('ibo-session-reply', function (event, arg) {
  const message = `Asynchronous message reply: ${arg}`
  console.log(message)
  // Here is where we now send our user to the next page

});
