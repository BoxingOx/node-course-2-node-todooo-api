var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI , { useNewUrlParser: true });
//||'mongodb://localhost:27017/TodoApp'

module.exports = {mongoose};  // only mongoose:mongoose
// module.exports = {
//   mongoose : mongoose;
// }
