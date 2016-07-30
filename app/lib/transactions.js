var request = require('request')
var EQ_BACKEND_URL = process.env.EQ_BACKEND_URL

var transaction = function(){

    var thisObj = this

    this.error = null

    this.transMessage = null;
    this.transErrorCode = null;
    this.transErrorText = null;
    this.transAuthCode = null;
    this.transId = null;

    this.chargeCreditCard = function(obj){

        if (obj.cardnumber && obj.expdate && obj.ccv && obj.amount){

            return new Promise(function(resolve, reject) {
                request({
                    url : EQ_BACKEND_URL + '/charge',
                    method : 'POST',
                    json : {
                            cardnumber  : obj.cardnumber,
                            expdate     : obj.expdate,
                            ccv         : obj.ccv,
                            amount      : obj.amount
                        }
                    },
                    function( error, response, body ) {

                        if (error){
                            console.error("ERROR making post request to " + EQ_BACKEND_URL + '/charge')
                            thisObj.error = error
                            resolve(thisObj)
                        }
                        else if (!error && response.statusCode == 200) {
                            //console.log(body)

                            if (body.error){
                                console.log(body.error)
                                resolve(thisObj)
                            }

                            if (body.response.transId && body.response.authCode){
                                thisObj.transId         = body.response.transId
                                thisObj.transMessage    = body.response.message
                                thisObj.transAuthCode   = body.response.authCode
                            }
                            else {
                                thisObj.transMessage    = body.response.message
                                thisObj.transErrorCode  = body.response.errorCode
                                thisObj.transErrorText  = body.response.errorText
                            }

                            resolve(thisObj)
                        }
                        else {
                            console.warn("There was a different response")
                            thisObj.error = "different response other than 200"
                            resolve(thisObj)
                        }
                })
            });
        }
        else {
            console.error("ERROR, invalid credentials");
            thisObj.error = "ERROR, invalid credentials";
            return thisObj
        }
    }

    this.voidTransaction = function(obj){

        if (obj.transid){
            return new Promise(function(resolve, reject) {
                request({
                    url : EQ_BACKEND_URL + '/void',
                    method  : 'POST',
                    json : {
                        transid : obj.transid
                    }

                }, function(error, response, body){
                    if (error){
                        console.error("ERROR making post request to " + EQ_BACKEND_URL + '/void')
                        thisObj.error = error
                        resolve(thisObj)
                    }
                    else if (!error && response.statusCode == 200){
                        console.log(body)
                        thisObj.response = body
                        resolve(thisObj)
                    }
                    else {
                        console.warn("There was a different reponse")
                        console.log(response, body)
                        thisObj.response = body
                        resolve(thisObj)
                    }
                })
            });


        }
        else {
            console.error('Not enough paramters fam')
            thisObj.error = "Not enough paramters fam"
            return thisObj
        }
    }

    this.refundTransaction = function() {
        new Promise(function(resolve, reject) {
            resolve(thisObj)
        });
    }


    /*when we instantiate a new variable*/
    return this
}


var newTrans = new transaction()

newTrans.chargeCreditCard({
    cardnumber  : "4242424242424242",
    expdate     : "0220",
    ccv         : "123",
    amount      : "1999.99"
}).then(function(obj){

    if (obj.error){

    }
    else {
        console.log(obj.transactionId)
    }

})


/*
test.voidTransaction({
    transid  : '60005921714'
})
*/
module.exports = transaction
