const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')

var UserSchema = new mongoose.Schema({  // schema may not exist or something, we need this schema property to tac on custom methods comming up...
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate:{
      validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
   }// end ValidatE object
 },// end inner email object
  password: {
    type: String,
    required: true,
    minlength: 6,
  },// end password object
  tokens: [{
    access:{
      type: String,
      required: true
    }, // end access property of tokenS
    token:{
      type: String,
      required: true
    }// end token property of tokenS
  }]// end tokenS array with its inner object scope thing
});// end Schema property and its object

UserSchema.methods.toJSON = function(){           //we modified this toJSON method
  var user = this;  // identifier
  var userObject = user.toObject();  // takes mongoose var user and converts it to reg var where only props available on the doc exist
  return _.pick(userObject, ['_id', 'email']);  // these ones get returned..
}; // end tagged on altered method

UserSchema.methods.generateAuthToken = function(){ // we made this generateAuthTokens method
  var user = this;  // identifier
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access},'abc123').toString(); // avc123 is the secrect
  user.tokens = user.tokens.concat([{access,token}]);
  // user.tokens.push({access,token}); // es6 syntax
   user.save().then(() =>{  // save occurs in serverjs , works without preceding return
    return token;
  });// end the this object to be returned back to server.js
}; // end tagged on method generateAuthToken that has been heavily tweaked


  UserSchema.statics.findByToken = function (token) { // we access statics 'stead  of methods although methods added here are model methods as opposed to instance methods
     var User = this;
     var decoded;
     try {
       decoded = jwt.verify(token, 'abc123'); // the token to decode and the secrect
     } catch (e) {
       // return new Promise((resolve,reject) =>{
       //   reject();  // will be noticed by send call back in server.js
       // })// end promise object
       return Promise.reject();
     } // end catch
     return User.findOne({  // still works without preceding return keyword NOPE- GET DOESNT work without it
       _id: decoded._id,
       'tokens.token' : token,
       'tokens.access' : 'auth',
     });// end findOne
  };// end method findByToken


  UserSchema.pre('save', function(next){
    var user = this;
    if(user.isModified('password'))
      bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(user.password, salt, (err, hash) =>{
          user.password = hash;  // the password is encrypte and can be stored as it is in the database. We will need a decrypting fxn called compare
          next();
        })// end hash
      });// end genSalt
    else
      next();
   });// end pre fxn


var User = mongoose.model('User',UserSchema);// end  model object // the custom methods are in UserSchema.methods property

module.exports = {User}
