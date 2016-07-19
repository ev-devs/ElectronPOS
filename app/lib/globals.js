var URL = process.env.EQ_URL.toString();
var request = require('request');
var _ = require("underscore");

var inventory = [];
var platinums = [];
function inherit_platinums() {
  return new Promise(function(resolve, reject) {
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
        resolve(leaders);
      } else if (error) {
        reject(error);
      } else {
        //console.log(body);
      }
    });
  });
}

function inherit_inventory() {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
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
