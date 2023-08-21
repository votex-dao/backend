const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  address: String,
  daolist: [String],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
