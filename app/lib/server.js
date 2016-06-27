var express = require('express');
var passport = require('passport');
var session = require('express-session');
var tkn_strtgy = require('passport-token-auth').Strategy;
var app = express();

app.use(session({
  cookie : {maxAge : 60000},
  secret: 'biticks',
  resave : true,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.get('/', function(req, res){
    res.send('hello world!');
    console.log('we in BROOO!');
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.listen(3000, function(){
    console.log('listening on port 3000');

});
