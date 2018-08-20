const expectt = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');  // local files loaded in from module.exports we dont need to trquire (server.js).app with destructuring
const {Todo} = require('./../models/todo');

  const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed : true,
    completedAt : 333
  }];  // end  objects to be loaded in



beforeEach((done) =>{       // Testing lifecycle method. database empty each time
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());  // done first only then can program move on to test cases
}); // end  insert objects loading in

describe('POST/todos', () => {
 it('should create a new todo', (done) =>{
   var text = 'Test todo text';
     request(app)
     .post('/todos')
     .send({text})
     .expect(200)
     .expect((res) =>{
       expectt(res.body.text).toBe(text); // is it equal to the sent JSON text above? rhetorical   Is the reponse the same as the variable text?
     })// end assertion of response
      .end((err, res)=>{
        if(err)
        return done(err);  // failed test case  failure was passed on from expect whhere it was not thrown. error rethrown here
        Todo.find({text}).then((todos) =>{  // find returns an array?
          expectt(todos.length).toBe(1);
          expectt(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));        //   If for some reason an error occurs within find, make sure the test then fails
      });//end end chain
 });// It 1 End Describe 1


  it('should not create todo with invalid body data', (done) => {
      request(app)
        .post('/todos')
        .send({})   // send  nothing to server
        .expect(400) // expect an error code of 400
        .end((err, res)=>{
          if(err)
          return done(err);
          Todo.find().then((todos) => {
            expectt(todos.length).toBe(2);
            done();
        }).catch((e) => done(e));  // end Todo.find
    }); // end end call
  }); // It 2 End Describe 1
});// End Describe 1

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expectt(res.body.todos.length).toBe(2); // hthat is if there are only 2 todos
      }) // end body assertion
      .end(done); // end end call
  }); // end It 1 Describe 2
});  // end Describe 2

describe('GET /todos/:id', () => {
  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString(); // some random new id
    // console.log(` OBJECTID   IS   ${hexId}`);
    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });// end It 1 Describe 3

    it('should return todo doc', (done) => {

      // console.log(`TODOS ID IS ${todos[0]._id}`);  // undefined
        // var HexId2 = todos[0]._id.toHexString();
        // 5555
       // 5b76d8183de0420d0c092e0c
       // var hex = 5b76d8183de0420d0c092e0c;

      request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expectt(res.body.tod.text).toBe(todos[0].text); // we look at 1st doc in array look at response text vs text in db
        console.log(`the body is  ${res.body}`);
        })
          .end(done); // end end call
      });// end It 2 Describe 3

    it('should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123abc')
        .expect(404)
        .end(done);
      }); // end It 3 Describe 3
  });// end Describe 3


  describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) =>{
        expectt(res.body.tod._id).toBe(hexId);
        console.log(`Value expected is ${res.body.tod._id}`);
      })
      .end((err,res) =>{
      if(err)
      return done(err);// test failed
      Todo.findById(hexId).then((tod) =>{
          console.log(`Value of document by deleted id is expected in findById is ${tod}`);
          // expectt(tod).toNotExist();
          expectt(tod).toBe(null);
          done();
        }).catch((e) => done(e));// end database check
      });// end  end res params and fxn
   });// end it 1

 it('should return 404 if todo not found', (done) => {
   var hexId = new ObjectID().toHexString();
   request(app)
     .delete(`/todos/${hexId}`)
     .expect(404)
     .end(done);
   });// ebd It 2 Describe 4

 it('should return 404 if object id is invalid', (done) => {
   request(app)
     .delete('/todos/123abc')
     .expect(404)
     .end(done);
   });// end It 3 Describe 4
});// end describe 4


describe('PATCH /todo/:id', () =>{
 it('should update the todo', (done) => {
  var hexId = todos[0]._id.toHexString();
   var text = 'Testing Text 1';
   request(app)
     .patch(`/todos/${hexId}`)
     .send({completed: true,
            text
          })// end send
          .expect(200) // end server status assertion that it executed as stated
          .expect((res) => {
            expectt(res.body.tod.text).toBe(text);
            expectt(res.body.tod.completed).toBe(true);
            console.log(`The value of res.body.tod.completedAt is : ${res.body.tod.completedAt}`);

            // expectt(res.body.tod.completedAt).toMatch(/1534/);//1534765946836
          //  expectt(res.body.tod.completedAt).toBeA('number'); //1534
          })
          .end(done);
 });// end It 1 Describe 5


 it('should clear completedAt when todo isnt completed', (done) => {

   var hexId = todos[1]._id.toHexString();
     var text = 'Testing Text 2';

   request(app)
     .patch(`/todos/${hexId}`)
     .send({completed: false,
            text
   })
   .expect(200)
   .expect((res) => {
     expectt(res.body.tod.text).toBe(text);
     expectt(res.body.tod.completed).toBe(false);
     expectt(res.body.tod.completedAt).toBe(null);
   })
   .end(done);
 });// end it 2


});// end describe 5
