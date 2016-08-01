


var execSync = require('child_process').execSync
var exec = require('child_process').exec
var internet = {

    remove_dup : function(wifis){
        /*You may be wondering why? What the hell is this fam? Well it removes the second index of the wifis array because the second index is "" and that is annoying*/
        var i = wifis.indexOf("");
        if(i != -1) {
          wifis.splice(i, 1);
           wifis.splice(i, 1);
        }
        /*This new array will hold the wifis without duplicates.*/
        var connections = [];
        /*We start at the bottom because by default the connections are sorted from lowest to highest connection quality
        with the worst connection being at the top and best at the bottom*/
        for(var i = wifis.length - 2; i > 1; i--) {
          /*Grabs the name of a connection from an index in the wifi array, excluidng the double quotes around the name*/
          var essid = wifis[i].substring(wifis[i].search("\"") + 1, wifis[i].lastIndexOf("\""));
          /*Grabs whether or not the connection needs a passkey, so either on or off*/
          var psk = wifis[i].substring(wifis[i].search(":o") + 1, wifis[i].search("ES") - 1);
          /*Combines them into one string*/
          var combined = essid + "~" + psk;
          /*If that string is not found within the connections array then put it in. If it is then exclude it. */
          if(connections.indexOf(combined) == -1 && essid != "") {
            connections.push(combined);
          }
        }
        return connections;
    },

    JSONify : function(connections){
        for(var i = 0; i < connections.length; i++) {
          /*Makes the elements of the array into JSON*/
          var wifi = {
            /*Takes the name of the connection*/
            "essid" : connections[i].substring(0, connections[i].search("~")),
            /*Takes the string that determines whether or not the conneciton require a passkey*/
            "psk" : connections[i].substring(connections[i].search("~") + 1, connections[i].length)
          }
          /*Overwrites the current index value with the JSON object*/
          connections[i] = wifi;
        }
        /*Runs the wifi_cur.sh script to get the output and store it as a string*/
        var cur = execSync( __dirname + '/../../dixonconnect/wifi_cur.sh cur').toString();
        /*pushes it as the last element for easy access*/
        connections.push(cur);
        return connections;
    },

    list_connections : function(){
        return this.JSONify(this.remove_dup(execSync( __dirname + '/../../dixonconnect/wifi_script.sh').toString('utf-8').split('\n')));
    },
    connect : function(){
        // ideally you would connect using this function
    }
}

module.exports = internet;

/* JQUERY EVENTS FOR INTERNET CONFIGURATIONS*/
var ap_name = "";
var psk = "";
/*Upon accepting a Wi-Fi connection this funtion will run the script which handels connection. If the password is wrong then the connection will
not happen*/
$(document).on('click', '#accept', function() {
  psk = $("#keyboard").val();
   //execSync("sudo " + __dirname + "/../../dixonconnect/wifi_rem.sh ");
  if(psk.search("#") != -1) {
    console.log("PRESENT");
    psk = psk.replace(/#/g, "\\#");
  }
  console.log(psk);
  //var status = execSync( "sudo " + __dirname + "/../../dixonconnect/wifi_con.sh " + ap_name + " " + psk);
  var status = "";
  connect(ap_name, psk).then(function(obj){
    /*If no connection is made then after running the wifi_cur.sh script again the word "none" will appear*/
    console.log(obj.toString())
    if(obj.toString().search("FAILED") == -1) {
       console.log("CONNECTED");
       var cur = execSync("sudo " + __dirname + "/../../dixonconnect/wifi_cur.sh con").toString();
       $("#cur_con").text("Wi-Fi: " + cur);
       status = document.getElementById("cur_con").innerText.toString();
       document.getElementById("cur_con").dispatchEvent(connected);
    }
    else {
      $('failModal').openModal({
          dismissible: true, // Modal can be dismissed by clicking outside of the modal
          opacity: .5, // Opacity of modal background
          in_duration: 300, // Transition in duration
          out_duration: 200, // Transition out duration
      });
      $("#loading").remove();
      $("#connecting").remove();
      $("#cur_con").text("Wi-Fi: none");
     }
  });
  var load = "  <div id=\"loading\" class=\"preloader-wrapper small active\"> \
    <div class=\"spinner-layer spinner-green-only\"> \
      <div class=\"circle-clipper left\"> \
        <div class=\"circle\"></div> \
      </div><div class=\"gap-patch\"> \
        <div class=\"circle\"></div> \
      </div><div class=\"circle-clipper right\"> \
        <div class=\"circle\"></div> \
      </div> \
    </div> \
  </div> \
  <span id=\"connecting\">Connecting...</span>";
  $("#connection_holder").append(load);
  //$("#connection_holder").append(proceed);
});



function connect(ap_name, psk) {
  return new Promise(function(resolve, reject) {
    exec( "sudo " + __dirname + "/../../dixonconnect/wifi_con.sh " + ap_name + " " + psk, (error, stdout, stderr) => {
      resolve(stdout);
    });
  });
}


/*Simply grabs the name of the access point which is stored in two ways, as the id and the text of the <a> tag*/
$(document).on('click', '.wifi_option', function() {
  ap_name = $(this).attr('id');
  if(ap_name.search("#") != -1)
    ap_name = ap_name.replace(/#/g, "\\#")
});

/*When the remove connection button is pressed then remove the current connection*/
$(document).on('click', '#remove', function() {
  execSync("sudo " + __dirname + "/../../dixonconnect/wifi_rem.sh ");
  $("#cur_con").text("Wi-Fi: none");
  $("#remove").remove();
  $("#proceed").remove();
});
