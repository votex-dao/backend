const mongoose = require('mongoose');

const daoSchema = new mongoose.Schema({
  address: String,
  cid: Object,
  proposals: [Object],
  users: [String],
});

const Dao = mongoose.model('Dao', daoSchema);

module.exports = Dao;
