'use strict';
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  created_by: String,
  assigned_to: String,
  open: { type: Boolean, default: true },
  status_text: String
});

let Issues = mongoose.model('Issues', issueSchema);

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      //send all issues
    })

    .post(function (req, res) {
      let project = req.params.project;
      //create issue
    })

    .put(function (req, res) {
      let project = req.params.project;
      //update issue
    })

    .delete(function (req, res) {
      let project = req.params.project;
      //delete issue
    });
};
