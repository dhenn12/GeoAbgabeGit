let mongoose = require('mongoose');

// Article Schema
let routeSchema = mongoose.Schema({
  user:{
    type: String
  },
  date:{
    type: String
  },
  starttime:{
    type: String
  },
  endtime:{
    type: String
  },
  waypoints:{
    type: String
  },
  shared:{
    type: String
  }
});

let Route = module.exports = mongoose.model('Route', routeSchema);
