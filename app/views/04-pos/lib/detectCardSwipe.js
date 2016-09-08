/***********************DETECTCARDSWIPE.JS***********************/
/*
const HID = require('node-hid');
var devices = HID.devices() // this lists all the devices
var usbCardReader = null; // this is going to be our

console.log(devices)

for (device in devices) {

    if (devices[device].manufacturer == "Mag-Tek" && devices[device].product == 'USB Swipe Reader'){
        //console.log(devices[device].vendorId)
        usbCardReader = new HID.HID(  devices[device].path  );
        return
    }
}

usbCardReader.on("data", function(data) {
    console.log(data)
});
*/
