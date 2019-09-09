let mongoose = require('mongoose');

// Article Schema
let routeSchema = mongoose.Schema({
  user:{
    type: String
  },
  starttime:{
    type: String
  },
  endtime:{
    type: String
  },
  waypoints:{
    type: Array
  },
  shared:{
    type: String
  }
});

let Route = module.exports = mongoose.model('Route', routeSchema);
