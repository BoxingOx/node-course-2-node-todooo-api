// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

const url = 'mongodb://localhost:27017';

const dbName = 'TodoApp';

MongoClient.connect(url, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
 const db = client.db(dbName);
  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  // Insert new doc into Users (name, age, location)
// const db2 = client.db('TodoApp')
//   db2.collection('Users').insertOne({
//     name: 'Andrew',
//     age: 25,
//     location: 'Philadelphia'
//   }, (err, result) => {
//     if (err) {
//       return console.log('Unable to insert user', err);
//     }
//
//     console.log(result.ops);
//     console.log(result.ops[0]._id.getTimestamp());
//   });

  client.close();
});
