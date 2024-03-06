const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date, default: new Date() },
  updated_on: { type: Date, default: new Date() },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  open: { type: Boolean, default: true }
});

let Issues = mongoose.model('Issues', issueSchema);

module.exports = Issues;
