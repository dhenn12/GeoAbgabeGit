let mongoose = require('mongoose');

// Article Schema
let encounterSchema = mongoose.Schema({
  user1:{
    type: String
  },
  user2:{
    type: String
  },
  coords:{
    type: Array
  },
  route1ID:{
    type: String
  },
  route2ID:{
    type: String
  }
});

let Encounter = module.exports = mongoose.model('Encounter', encounterSchema);
