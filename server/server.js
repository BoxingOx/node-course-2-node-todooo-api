require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate')

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json()); // allows req.body. the body parameter


app.post('/todos',authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,   // new doc in post with text being set to a specific value
    _creator: req.user._id
  });// end todo object
  todo.save().then((doc) => {  // save var todo 'ie the doc' to db. e can then send the doc to the server (save returns doc
    res.send(doc);             // we can then use response object to send ) to see it, we can see this reponse in postman  // if 200 it sent
  }, (e) => {
    res.status(400).send(e); // many params set in ORM todo.js, error if these arent met
  });// end then callback with 2 parameters
});  // end App POST /todos

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});      // send docs to server, the RESPONSE
  }, (e) => {
    res.status(400).send(e);
  });// end then callback with 2 fxns
});// end app GET /todos

app.get('/todos/:id',authenticate, (req, res) => { // error was todo in server.js vs tod in server.test.js
  var id = req.params.id;             // our input for a search request based on parameters
  if (!ObjectID.isValid(id)) // ObjectID is a mongoose object and isValid is its built-in method
    return res.status(404).send();// invalid id finish scope fxn early
  Todo.findOne({
    _id: id,
    _creator: req.user._id
    }).then((tod) => {  // so the id is of a valid form... Now is the URI not malformed? if so then its not 400
    if (!tod)
      return res.status(404).send();  // finish early
    // else
    console.log("Get One works");
    res.send({tod});
  }).catch((e) => { // there could be other errors besides the id
    res.status(400).send();
  });// end catch chained onto then
});// end get todos/:id call

app.delete('/todos/:id',authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send();
    Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    }).then((tod) => {
      if (!tod)
        return res.status(404).send();
          res.send({tod});   // you forgot to send object use es6 syntav {tod}, that is why test fails
    }).catch((e) => {
      res.status(400).send();  //malformed
    });// end then call changed onto  findByIdAndRemove
});// end delete call

app.patch('/todos/:id',authenticate,(req,res) =>{   ///  error was Here!!!!! Thats why no console.log!!!
    var id = req.params.id; // get the id
    //The input request sent to server
    //https://lodash.com/docs/4.17.10#pick    // We can only explicitly interact with text and completed
    var body = _.pick(req.body, ['text', 'completed']); // we should not be allowed to explicitly update some attribute stuff not specified like completedAt. We dont want a default upgrade without altering these 2 ifone  in the mongoose model
    // if (!ObjectID.isValid(id))
      return res.status(404).send();
    if(_.isBoolean(body.completed) && body.completed) // if boolean and TRUE( what we will send)...
    body.completedAt  = new Date().getTime();// time since 1970 jan 1st ??
    else{
    body.completed = false;
    body.completedAt = null;
        }// end else  Now we Actually update the value below...
    Todo.findOneAndUpdate({_id: id, _creator: req.user._id},{$set: body}, {new: true}).then((tod) => {
      if (!tod)
        return res.status(404).send();
          res.send({tod});
   }).catch((e) => {
      res.status(400).send();
   });// end then call chained onto Todo.findByIdAndUpdate
});// end app.patch for updates



  //USERS

app.post('/users', (req, res) => {
 var body = _.pick(req.body, ['email', 'password']) // these are required fields
 var user = new User(body);
 user.save().then(() => {  // save to db, before save, pre method hashes password
  return  user.generateAuthToken(); // seems to work without return preceding it. After saved to db, a token based on id is quickily generated and saved to db
   //res.send(doc);
  }).then((token) =>{  // the token generated from generateAuthToken and passed to then
   res.header('x-auth', token).send(user); // key/value pair custom header name is sent to server to view
  }).catch((e) =>{
     res.status(400).send(e);
  })// end catch on then call
});// end app POST USERS

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  // res.send(body);
 User.findByCredentials(body.email, body.password).then((user) =>{ // user is returned doc
   return user.generateAuthToken().then((token) => {
     res.header('x-auth', token).send(user);
   });// end genAuthToken call
     }).catch((e) =>{
       res.status(400).send();
     });// end findByCredentials call and then its 'then' and 'catch' chain calls
 });// end post to check login

app.get('/users/me', authenticate, (req, res) =>{ // authenticate is called
  res.send(req.user); // we altered req.users in aux method
 });// end app GET users

 app.delete('/users/me/token', authenticate, (req, res) =>{
   req.user.removeToken(req.token).then(() =>{
     res.status(200).send();
   }, () =>{
    res.status(400).send();
  });
 });

app.listen(port, () => {
  console.log(`Started on port ${port}`);
 });// end app.listen
module.exports = {app};
//module.exports.app = app;   // in requiring file call app.app
