const expectt = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');  // local files loaded in from module.exports we dont need to trquire (server.js).app with destructuring
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers); // end  insert objects loading in
beforeEach(populateTodos); // end  insert objects loading in

// describe('POST/todos', () => {
//  it('should create a new todo', (done) =>{
//   var text = 'Test todo text';
//      request(app)
//      .post('/todos')
//      .set('x-auth', users[0].tokens[0].token)
//      .send({text})
//      .expect(200)
//      .expect((res) =>{
//        expectt(res.body.text).toBe(text); // is it equal to the sent JSON text above? rhetorical   Is the reponse the same as the variable text?
//      })// end assertion of response
//       .end((err, res)=>{
//         if(err)
//         return done(err);  // failed test case  failure was passed on from expect whhere it was not thrown. error rethrown here
//         Todo.find({text}).then((todos) =>{  // find returns an array?
//           expectt(todos.length).toBe(1);
//           expectt(todos[0].text).toBe(text);
//           done
//         }).catch((e) => done(e));        //   If for some reason an error occurs within find, make sure the test then fails
//       })//end end chain
//  });// It 1 End Describe 1

  describe('POST/todos', () => { // be careful with this line
  it('should not create todo with invalid body data', (done) => {
      request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({})   // send  nothing to server
        .expect(400) // expect an error code of 400
        .end((err, res)=>{
          if(err)
          return done(err);
          Todo.find().then((todos) => {
            expectt(todos.length).toBe(2);
            done
        }).catch((e) => done(e));  // end Todo.find
    }) // end end call
  }); // It 2 End Describe 1
});// End Describe 1


describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expectt(res.body.todos.length).toBe(1); // hthat is if there are only 2 todos
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expectt(res.body.tod.text).toBe(todos[0].text); // we look at 1st doc in array look at response text vs text in db
        console.log(`the body is  ${res.body}`);
        })
          .end(done); // end end call
      });// end It 2 Describe 3

      it('should not return todo doc created by other user', (done) => {
        request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
            .end(done); // end end call
        });// end It 2 Describe 3

    it('should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123abc')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
      }); // end It 3 Describe 3
  });// end Describe 3


  describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[1].token)
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

   it('should remove a todo', (done) => {
     var hexId = todos[1]._id.toHexString();
     request(app)
       .delete(`/todos/${hexId}`)
       .set('x-auth', users[1].tokens[0].token)
       .expect(404)
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
     .set('x-auth', users[1].tokens[0].token)
     .expect(404)
     .end(done);
   });// ebd It 2 Describe 4

 it('should return 404 if object id is invalid', (done) => {
   request(app)
     .delete('/todos/123abc')
     .set('x-auth', users[1].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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

 it('should not update the todo creater by other user', (done) => {
  var hexId = todos[0]._id.toHexString();
   var text = 'Testing Text 1';
   request(app)
     .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
     .send({completed: true,
            text
          })// end send
          .expect(404) // end server status assertion that it executed as stated
          .end(done);
 });// end It 1 Describe 5

 it('should clear completedAt when todo isnt completed', (done) => {
   var hexId = todos[1]._id.toHexString();
     var text = 'Testing Text 2';
   request(app)
     .patch(`/todos/${hexId}`)
     .set('x-auth', users[1].tokens[0].token)
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




    //USERS

 describe('GET /users/me',() =>{
   it('should return user if authenticated', (done) =>{
     request(app)
     .get('/users/me')
     .set('x-auth', users[0].tokens[0].token)// the 1st token
     .expect(200)
     .expect((res) => {
       expectt(res.body._id).toBe(users[0]._id.toHexString());
       expectt(res.body.email).toBe(users[0].email)
       })
     .end(done);
   });// end it 1

   it('should return 404r if not authenticated', (done) =>{
     request(app)
       .get('/users/me')
       .expect(401)
       .expect((res) => {
         expectt(res.body).toEqual({}); // we expect the body to be empty
       })
       .end(done);
   });// end it 2
 }); // end describe 6


 describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example2@toBeorNotToBEEE34d.com';
    var password = '1234mnbee!';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) =>{
        // expectt(res.headers['x-auth']).toExist();
        // expectt(res.body._id).toExist();
        expectt(res.body.email).toBe(email);
      })
      .end((err) => {
        if(err)
          return done(err);
        User.findOne({email}).then((users) =>{
          // expectt(user).toExist();
          // expectt(users.password).toNotBe(password);
          done();
      });// end then call on findOne
    }); // end end call
   });// end it 1

  it('hould return validation errors if request invalid', (done) => {
    var email = 'and';
    var password = '123';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
   });// end it 2

  it('should not create user if email in use', (done) => {
    var email = users[0].email;
    var password = 'Password123!';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
   });// end it 3
 });// end describe 7
