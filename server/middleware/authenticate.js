var {User} = require('./../models/user');


var authenticate = (req, res, next) =>{
  var token = req.header('x-auth'); //find  request tokens value based on its x-auth key, always check to see that there is a value in request to be sent
  User.findByToken(token).then((user) =>{ //Check this value against the db
    if(!user)
    return Promise.reject();   // if all was okay then return dont execute then set the variables
    req.user = user;
    req.token = token;  // im not sure why this has been set. I dont think its used
    next(); // this must be called else app.get and other code below will not execute
  }).catch((e) =>{
    res.status(401).send();
  })// end findByToken
};// end var Authenticate


module.exports = {authenticate};
