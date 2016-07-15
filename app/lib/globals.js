var URL = process.env.EQ_URL.toString();
var request = require('request');
var _ = require("underscore");

var inventory = [];
/*function inherit_inventory() {
  var x = []
  request({
      method: 'POST',
      uri: URL + '/inventory',
      form: {
        token: process.env.EQ_TOKEN.toString()
      }
    }, function (error, response, body) {
      // console.log(body);
      if (!error && response.statusCode == 200) {
        var resp = JSON.parse(body);

        var ordItems = _.sortBy(resp.items, function (item) {
          return item.title;
        })
        x = ordItems;
      } else if (error) {
        console.log(error);
      } else {
        //console.log(body);
      }
    });
    return x;
};
*/
function inherit_platinums() {
  var x = [];
request({
		method: 'POST',
		uri: URL + '/evleaders',
		form: {
			token: process.env.EQ_TOKEN.toString()
		}
	}, function (error, response, body) {
		// console.log(body);
		if (!error && response.statusCode == 200) {

			leaders = JSON.parse(body).evleaders;
      x = leaders;

		} else if (error) {
			console.log(error);
		} else {
			//console.log(body);
		}
	});
  return x;
}

function inherit_inventory() {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    var x = [];
    request({
        method: 'POST',
        uri: URL + '/inventory',
        form: {
          token: process.env.EQ_TOKEN.toString()
        }
      },
      function (error, response, body) {
        // console.log(body);
        if (!error && response.statusCode == 200) {
          var resp = JSON.parse(body);
          x = [1,2,3]
          var ordItems = _.sortBy(resp.items, function (item) {
            return item.title;
          })
          resolve(ordItems);
        }
        else if (error) {
          reject(error);
        }
        else {
          //console.log(body);
        }
      });
  });
}
