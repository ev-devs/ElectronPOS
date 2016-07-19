var request = require('request');
var URL = process.env.EQ_URL.toString();

$('#events_submit').click(function(event){
    // error checking for event code
    if ($('#event_code').val() == ""){
         Materialize.toast('No Event Code!', 3000, 'rounded')
    }
    // error checking for event id
    if ($('#event_id').val() == ""){
         Materialize.toast('No Event Id!', 3000, 'rounded')
    }
    // error checking for event type input
    var status = 0;
    if (rgb2hex($($('.seminar').children()[0]).css('background-color')) == "#808080" && rgb2hex($($('.convention').children()[0]).css('background-color')) == "#808080"){
         Materialize.toast('No Event Type Selected', 3000, 'rounded')
    }
    else {
      if (rgb2hex($($('.seminar').children()[0]).css('background-color')) == "#00c853"){
        validate_event('s', $("#event_id").val(), $("#event_code").val())
        .then(function(result) {
            /*if(result == 1)
              console.log("Valid event!");
            else if(result == 0)
              console.log("Invalid event!");*/
            if(result[Object.keys(result)[0]] == -1)
              console.log("Invalid event!");
            else
              window.location.assign("../04-pos/index.html");
        })
        .catch(function(result) {
            console.log(result);
        });
      }
      if (rgb2hex($($('.convention').children()[0]).css('background-color')) == "#00c853"){
        validate_event('c', $("#event_id").val(), $("#event_code").val());
      }
    }
});

//window.location.assign("../04-pos/index.html");

var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
};

function validate_event(_type, _event, _code) {
  return new Promise(function(resolve, reject) {
    request({
      method: 'POST',
      uri: URL + '/eventaccess',
      form: {
        token: process.env.EQ_TOKEN.toString(),
        type: _type,
        event: _event,
        code: _code,
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var msg = JSON.parse(body);
        console.log(msg);
        resolve(msg);
      } else if (error) {
        console.log(error);
        reject(0);
        console.log("No event found");
      } else {
        //console.log(body);
      }
    });
  });
}
