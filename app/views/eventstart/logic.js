var http = require('http');

$('.seminar').click(function(event){
    $($('.convention').children()[0]).css('background-color', 'grey')
    $($(this).children()[0]).css('background-color', '#00c853')
});


$('.convention').click(function(event){
    $($('.seminar').children()[0]).css('background-color', 'grey')
    $($(this).children()[0]).css('background-color', '#00c853')
});

$('#events_submit').click(function(event){

    // error checking for event code
    if ($('#event_code').val() == ""){
         Materialize.toast('No Event Code!', 3000, 'rounded')
    }

    // error checking for event id
    if ($('#event_id').val() == ""){
         Materialize.toast('No Event Id!', 3000, 'rounded')
    }

    console.log('COLOR IS: ', rgb2hex($($('.seminar').children()[0]).css('background-color')) )

    // error checking for event type input
    if (rgb2hex($($('.seminar').children()[0]).css('background-color')) == "#808080" && rgb2hex($($('.convention').children()[0]).css('background-color')) == "#808080"){
         Materialize.toast('No Event Type Selected', 3000, 'rounded')
    }
    else {

        // seminar is chosen
        if (rgb2hex($($('.seminar').children()[0]).css('background-color')) == "#00c853"){

            var post_options = {
                  host: 'support.equipovision.com',
                  port: '3000',
                  path: '/ServiceForMobile.asmx/eventaccess',
                  method: 'GET',
                  headers: {
                      'Content-Type':'application/json',
                  }
              };

              http.request(post_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('Response: ' + chunk);
                });
            });

        }
        if (rgb2hex($($('.convention').children()[0]).css('background-color')) == "#00c853"){
            // convention is chosen


        }

    }
});


var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

// seminar is chosen
var post_options = {
      host: 'support.equipovision.com',
      port: '3000',
      path: '/ServiceForMobile.asmx/eventaccess',
      method: 'GET',
      headers: {
          'Content-Type':'application/json',
      }
  };

  http.request(post_options, function(res) {
    console.log(res)
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
    });
});
