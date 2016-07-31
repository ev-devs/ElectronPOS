const ipc = require('electron').ipcRenderer

$('#end-session').click(function(event){

    if ( transactionIsInProgress() ){
        // do error handling
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

})
