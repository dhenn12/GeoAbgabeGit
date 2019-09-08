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
  }
});

let Encounter = module.exports = mongoose.model('Encounter', encounterSchema);
