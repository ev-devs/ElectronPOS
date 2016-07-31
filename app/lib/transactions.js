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
                            console.error("Error making post request to " + EQ_BACKEND_URL + '/charge')
                            thisObj.error = error
                            resolve(thisObj)
                        }
                        else if (!error && response.statusCode == 200) {
                            if (body.error){
                                thisObj.error = body.error
                                console.error(body.error)
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
                                thisObj.error = true;
                            }
                            resolve(thisObj)
                        }
                        else {
                            console.warn("There was a different response")
                            thisObj.error = "different response other than 200"
                            console.warn(body)
                            resolve(thisObj)
                        }
                })
            });
        }
        else {
            console.error("ERROR, invalid credentials when making API call");
            thisObj.error = "Error, invalid credentials when making API call";
            return thisObj
        }
    }

    this.voidTransaction = function(obj){

        if (obj.transId){
            return new Promise(function(resolve, reject) {
                request({
                    url : EQ_BACKEND_URL + '/void',
                    method  : 'POST',
                    json : {
                        transId : obj.transId
                    }
                }, function(error, response, body){
                    if (error){
                        console.error("Error making post request to " + EQ_BACKEND_URL + '/void')
                        thisObj.error = error
                        resolve(thisObj)
                    }
                    else if (!error && response.statusCode == 200){
                        if (body.error){
                            thisObj.error = body.error
                            console.error(body.error)
                            resolve(thisObj)
                        }
                        if (body.response.transId){
                            //thisObj.transId       = body.response.transId
                            thisObj.transMessage    = body.response.message
                        }
                        else {
                            thisObj.transMessage    = body.response.message
                            thisObj.transErrorCode  = body.response.errorCode
                            thisObj.transErrorText  = body.response.errorText
                            thisObj.error = true
                        }
                        resolve(thisObj)
                    }
                    else {
                        console.warn("There was a different response other than 200")
                        console.log(body)
                        thisObj.error = true
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
        return new Promise(function(resolve, reject) {
            resolve(thisObj)
        });
    }
    /*when we instantiate a new variable*/
    return this
}

/****EXAMPLE CODE***/
var newTrans = new transaction()

newTrans.chargeCreditCard({
    cardnumber  : "4242424242424242",
    expdate     : "0220",
    ccv         : "123",
    amount      : "199.97"
}).then(function(obj){

    if (!obj.error){
        console.log(obj.transMessage)
        console.log("Trasaction Id:", obj.transId)
        console.log("Authorization Code:", obj.transAuthCode)
    }
    else {
        console.log(obj.transMessage)
        console.log("Error Code:", obj.transErrorCode)
        console.log("Error Text:", obj.transErrorText)
    }
    console.log('\n')
})


setInterval(function(){

    newTrans.voidTransaction({
        transId  : newTrans.transId
    }).then(function(obj){
        if (!obj.error){
            console.log(obj.transMessage)
            console.log("Transaction Id:", obj.transId)
        }
        else {
            console.log(obj.transMessage)
            console.log("Error Code:", obj.transErrorCode)
            console.log("Error Text:", obj.transErrorText)
        }
        console.log('\n')
    })

}, 5000)



module.exports = transaction
