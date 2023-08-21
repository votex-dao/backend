const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
invoiceId: String,
  users: [String],
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
