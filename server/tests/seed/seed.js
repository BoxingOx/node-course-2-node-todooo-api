
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'sean@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'sean2@example.com',
  password: 'userTwoPass'
}];


const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed : true,
  completedAt : 333
}];  // end  objects to be loaded in



const populateTodos = function (done){       // Testing lifecycle method. database empty each time
  this.timeout(10000)
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());  // done first only then can program move on to test cases
}// end fxn and populateTodos

const populateUsers = function (done){
  this.timeout(10000)
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();  // save to db we cant use insert many for some reason
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo])
  }).then(() => done());
};// end populayeUsers



module.exports = {todos, populateTodos, users, populateUsers};
