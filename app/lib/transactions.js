var request = require('request')
var EQ_BACKEND_URL = process.env.EQ_BACKEND_URL

var transaction = function(){


    this.transactionId = null;

    this.chargeCreditCard = function(obj){

        if (obj.cardnumber && obj.expdate && obj.ccv && obj.amount){
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
                        return null
                    }
                    else if (!error && response.statusCode == 200) {
                            console.log(body)
                            return body
                    }
                    else {
                        console.warn("There was a different response")
                        console.log(response , body)
                        return null
                    }
            })
        }
        else {
            console.error("ERROR, invalid credentials");
            return null
        }
    }

    this.voidTransaction = function(obj){

        if (obj.transid){
            request({
                url : EQ_BACKEND_URL + '/void',
                method  : 'POST',
                json : {
                    transid : obj.transid
                }

            }, function(error, response, body){
                if (error){
                    console.error("ERROR making post request to " + EQ_BACKEND_URL + '/void')
                    return null
                }
                else if (!error && response.statusCode == 200){
                    console.log(body)
                    return body
                }
                else {
                    console.warn("There was a different reponse")
                    console.log(response, body)
                    return null
                }
            })
        }
        else {
            console.log('Not enough paramters fam')
            return null
        }
    }

    this.refundTransaction = function() {
        console.log('refund!!')
    }
    return this
}

var test = new transaction()

test.chargeCreditCard({
    cardnumber  : "4242424242424242",
    expdate     : "0220",
    ccv         : "123",
    amount      : "100.39"
})

test.voidTransaction({
    transid  : '60005921714'
})

module.exports = transaction
