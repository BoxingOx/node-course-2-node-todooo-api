const expectt = require('expect');
const request = require('supertest');

const {app} = require('./../server');  // local files loaded in from module.exports we dont need to trquire (server.js).app with destructuring
const {Todo} = require('./../models/todo');

const todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
}];

beforeEach((done) =>{       // Testing lifecycle method. database empty each time
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());  // done first only then can program move on to test cases
});

describe('POST/todos', () => {
 it('should create a new todo', (done) =>{
   var text = 'Test todo text';
     request(app)
     .post('/todos')
     .send({text})
     .expect(200)
     .expect((res) =>{
       expectt(res.body.text).toBe(text); // is it equal to the sent JSON text above? rhetorical
     })
      .end((err, res)=>{
        if(err)
        return done(err);  // failed test case  failure was passed on from expect whhere it was not thrown. error rethrown here

        Todo.find({text}).then((todos) =>{  // find returns an array?
          expectt(todos.length).toBe(1);
          expectt(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));        //   If for some reason an error occurs within find, make sure the test then fails

      });//end end chain


 });


  it('should not create todo with invalid body data', (done) => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res)=>{
          if(err)
          return done(err);

          Todo.find().then((todos) => {
            expectt(todos.length).toBe(2);
            done();
        }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});
