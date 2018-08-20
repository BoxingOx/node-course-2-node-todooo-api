require('./config/config');

const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text   // new doc in post with text being set to a specific value
  });// end todo object

  todo.save().then((doc) => {  // save to db. e can then send the doc to the server (save returns doc
    res.send(doc);             // we can then use response object to send ) to see it, we can see this reponse in postman  // if 200 it sent
  }, (e) => {
    res.status(400).send(e); // many params set in ORM todo.js, error if these arent met
  });// end then callback with 2 parameters
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});      // send docs to server, the reponnse
  }, (e) => {
    res.status(400).send(e);
  });
});

  app.get('/todos/:id', (req, res) => {
    var id = req.params.id;             // our input for a search request based on parameters

    if (!ObjectID.isValid(id)) // ObjectID is a mongoose object and isValid is its built-in method
      return res.status(404).send();// invalid id finish scope fxn early


    Todo.findById(id).then((todo) => {  // so the id is of a valid form... Now is the URI not malformed? if so then its not 400
      if (!todo)
        return res.status(404).send();  // finish early

      // else
      console.log("Get One works");
      res.send({todo});
    }).catch((e) => { // there could be other errors besides the id
      res.status(400).send();
    });
  }// end fxn parameter
);// end get todos/:id call

app.delete('/todos/:id', (req, res) => {

  var id = req.params.id;

  if (!ObjectID.isValid(id))
    return res.status(404).send();


    Todo.findByIdAndRemove(id).then((tod) => {

      if (!tod)
        return res.status(404).send();

          res.send({tod});   // you forgot to send object use es6 syntav {tod}, that is why test fails

    }).catch((e) => {
      res.status(400).send();  //malformed
    });// end then call changed onto  findByIdAndRemove
});// end delete call


app.patch('/todos/:id',(req,res) =>{   ///  error was Here!!!!! Thats why no console.log!!!

    var id = req.params.id; // get the id

    //The input request sent to server
    var body = _.pick(req.body, ['text', 'completed']); // we should not be allowed to update some attribute stuff not specified like completedAt. We dont want a default upgrade without altering these 2 ifone  in the mongoose model

    if (!ObjectID.isValid(id)){
      console.log('Apparently id is invalid');
      return res.status(404).send();
    }// end if statement

    if(_.isBoolean(body.completed) && body.completed){ // if boolean and true...
    body.completedAt  = new Date().getTime();// time since 1970 jan 1st ??
      }
    else{
    body.completed = false;
    body.completedAt = null;
    }// end else

    Todo.findByIdAndUpdate(id,{$set: body}, {new: true}).then((tod) => {

      if (!tod){
          console.log(`Apparently there is no tod. Value of tod: ${tod}`);
        return res.status(404).send();
      }// end if statement

          res.send({tod});
    }).catch((e) => {
      res.status(400).send();
    });// end then call chained onto Todo.findByIdAndUpdate

});// end app.patch for updates

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
//module.exports.app = app;   // in requiring file call app.app
