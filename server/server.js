var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });// end todo object

  todo.save().then((doc) => {  // save to db. e can then send the doc to the server (save returns doc
    res.send(doc);             // we can then use response object to send ) to see it, we can see this reponse in postman
  }, (e) => {
    res.status(400).send(e);
  });// end then callback with 2 parameters
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  })
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};
//module.exports.app = app;   // in requiring file call app.app
