let mongoose = require('mongoose');

// Article Schema
let userSchema = mongoose.Schema({
  name:{
    type: String
  },
  routes:{
    type: Array
  }
});

let User = module.exports = mongoose.model('User', userSchema);
