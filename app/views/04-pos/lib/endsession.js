/***********************ENDSESSION.JS***********************/

$('#end-session').click(function(event){

    if (can_end_session == 0){
      $('#modal9').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
      });
    }
    else {
        ipc.send('ibo-session-end', 'ending session now')
    }

})

// returns true if transaction is in progress
function transactionIsInProgress(){
    // chcek to see if the plane is completely empty
}

ipc.on('ibo-session-end-reply', function (event, arg) {
  const message = `Asynchronous message reply from main process: ${arg}`
  console.log(message)
  window.location.assign('../03-beginsession/index.html')
})
