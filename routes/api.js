'use strict';
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

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      //send all issues
    })

    .post(async (req, res) => {
      //create issue
      try {
        let project = req.params.project;
        let issueInputData = {
          project: project,
          ...req.body
        };
        const issueInDb = (await Issues.create(issueInputData)).toObject();
        const { project: projValue, __v: vValue, ...issueResponse } = issueInDb;
        res.json(issueResponse);
      } catch (err) {
        res.status(500).json({ error: 'required field(s) missing' });
      }
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
