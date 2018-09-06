var {User} = require('./../models/user');


var authenticate = (req, res, next) =>{
  var token = req.header('x-auth');
  User.findByToken(token).then((user) =>{
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
