
var env = process.env.NODE_ENV || 'development';  // development for non test localhost
//console.log('env ******', env)

if (env === 'development' || env ==='test'){
  var config  = require('./config.json');
  var envConfig = config[env]; // dev or test object
  Object.keys(envConfig).forEach((key) =>{
    process.env[key] = envConfig[key]; // add values to process.env like JWT_SECRECT
  })// end forEach and its internal fxn
}// end if statement

// if(env === 'development'){
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// } else if(env === 'test'){
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }
