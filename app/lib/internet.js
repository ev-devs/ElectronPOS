var execSync = require('child_process').execSync
var exec = require('child_process').exec
var internet = {

  list_connections_S : function(){
    return this.JSONify(this.remove_dup(execSync( __dirname + '/../../dixonconnect/wifi_script.sh').toString('utf-8').split('\n')));
  },

  list_connections_A : function(){
    render_connections().then(function(obj) {
      var connections = obj.toString().split("\n");
      connections = JSONify(remove_dup(connections))
      $('main').html(ejs.render(fs.readFileSync( __dirname + '/../views/01-internet/partials/connectlist.html', 'utf-8') , {
          output  : connections
      }))
    })
  }
}

module.exports = internet;

function remove_dup(wifis){
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
};

function JSONify(connections){
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
};


/* JQUERY EVENTS FOR INTERNET CONFIGURATIONS*/
var ap_name = "";
var psk = "";
/*Upon accepting a Wi-Fi connection this funtion will run the script which handels connection. If the password is wrong then the connection will
not happen*/
$(document).on('click', '#accept', function() {
  document.dispatchEvent(processConnection);
});
var processConnection = new CustomEvent('processConnection', {});
document.addEventListener('processConnection', function(e) {
  if(!no_psk) {
    psk = $("#keyboard").val();
    psk = bashify(psk);
  }
  else {
    psk = "NONE"
  }
  console.log("NAME: {" + ap_name + "}");
  console.log("PSK: {" + psk + "}");
  var status = "";
  connect(bashify(ap_name), psk).then(function(obj){
    /*If no connection is made then after running the wifi_cur.sh script again the word "none" will appear*/
    if(obj.toString().search("FAILED") == -1) {
       console.log("CONNECTED");
       var cur = ap_name;
       $("#cur_con").text("Wi-Fi: " + cur);
       status = document.getElementById("cur_con").innerText.toString();
       document.getElementById("cur_con").dispatchEvent(connected);
    }
    else {
      $('#failModal').openModal({
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
});

function connect(ap_name, psk) {
  execSync("sudo " + __dirname + "/../../dixonconnect/wifi_rem.sh ");
  return new Promise(function(resolve, reject) {
    exec( "sudo " + __dirname + "/../../dixonconnect/wifi_con.sh " + ap_name + " " + psk, (error, stdout, stderr) => {
      resolve(stdout);
    });
  });
}

function render_connections() {
  return new Promise(function(resolve, reject) {
    exec( __dirname + '/../../dixonconnect/wifi_script.sh', (error, stdout, stderr) => {
      resolve(stdout);
    });
  });
}

var escape = function(match) {
  match = "\\" + match;
  return match;
}

function bashify(word) {
  word = word.replace(/#|'| |>|<|"|!|&|$|\*|\||\$|`|\\/g, escape);
  return word.slice(0, word.length - 1);
}

var no_psk = false;
/*Simply grabs the name of the access point which is stored in two ways, as the id and the text of the <a> tag*/
$(document).on('click', '.wifi_option', function() {

  if($(this).hasClass("psk_on")) {
    $('#modal1').openModal({
        opacity : 0
    });
    $('#keyboard-modal').openModal({
        opacity : 0
    });
  }
  else {
    no_psk = true;
  }
  ap_name = $(this).attr('id');
  $("#remove").remove();
  $("#proceed").remove();
});

/*When the remove connection button is pressed then remove the current connection*/
$(document).on('click', '#remove', function() {
  execSync("sudo " + __dirname + "/../../dixonconnect/wifi_rem.sh ");
  $("#cur_con").text("Wi-Fi: none");
  $("#remove").remove();
  $("#proceed").remove();
});

$(document).on('click', '#rescan', function() {
  $('main').html(ejs.render(fs.readFileSync( __dirname + '/../views/01-internet/partials/loader.html', 'utf-8') , {}))
  render_connections().then(function(obj) {
    var connections = obj.toString().split("\n");
    connections = JSONify(remove_dup(connections))
    $('#keyboard-modal').remove()
    $('main').html(ejs.render(fs.readFileSync( __dirname + '/../views/01-internet/partials/connectlist.html', 'utf-8') , {
        output  : connections
    }))
  })
});
