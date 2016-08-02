

'use strict'

const electron = require('electron');
// Module to control application life
const {app, globalShortcut } = electron
// Module to create native browser window.
const {BrowserWindow} = electron
// Module to communicate between the processes
const ipc = electron.ipcMain

// This is used to update our sessions and products
// var mongoose = require('mongoose')
var Session = require('./app/lib/sessions.js')

var current_ibo_session = null;

var current_event = null;
// Report crashes to our server.
// electron.crashReporter.start({companyName : 'asdf', submitURL : 'localhost'});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow(window) {
  // Create the browser window.
  window = new BrowserWindow({
      //fullscreen : true,
      height : 600,
      width : 100000,
      autoHideMenuBar : true,
      scrollBounce : true,
      frame: false
  });

  window.setMenu(null);

  // and load the index.html of the app.
  window.loadURL(`file://${__dirname}/app/index.html`);

  // Open the DevTools.
  window.webContents.openDevTools();

  // Emitted when the window is closed.
  window.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

    /* globalShortcut.register('CommandOrControl+J+K+M', () => {
        app.quit()
    });*/

    globalShortcut.register('CommandOrControl+C', () => {
        app.quit()
    })

    createWindow(win)
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  /* if (process.platform !== 'darwin') {
    app.quit();
} */
  app.quit()
});


app.on('will-quit', () => {

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();

});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipc.on('ibo-session-message', function (event, arg) {
    current_ibo_session = arg
    console.log(arg)
    event.sender.send('ibo-session-reply', 'Started New Session Successfully')
});

ipc.on('ibo-session-end', function(event, arg){
    // we end the session here
    console.log(current_ibo_session);

    // we make our current session null
    // current_ibo_session = null
    //console.log(arg)
    event.sender.send('ibo-session-end-reply', 'Ended Session Successfully')
});

ipc.on('event-validation-success', function(event, arg){
    current_event = arg;
    console.log(arg)
    event.sender.send('event-validaton-success-reply', "Recieved Current Event")
});

ipc.on('transaction-made', function(event, arg){
    // we add a transaction to the user
    console.log(arg)
    event.sender.send('transaction-made-reply', 'Updated transaction count for current session')
})
