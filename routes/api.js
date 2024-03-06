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
  //delete all documents of test-project
  app.delete('/api/issues/delete-testdata', async (req, res) => {
    try {
      const deletedCount = await Issues.deleteMany({ project: 'test-project' });
      res.send(deletedCount);
    } catch (err) {
      res.send(err);
    }
  });

  app
    .route('/api/issues/:project')
    .get(async (req, res) => {
      //send all issues or filtered by req.query
      try {
        const projectName = req.params.project;
        const issueList = await Issues.find({ project: projectName, ...req.query }, '-project -__v');
        res.send(issueList);
      } catch (err) {
        res.status(500).send(err);
      }
    })
    .post(async (req, res) => {
      //create issue
      try {
        const project = req.params.project;
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
    .put(async (req, res) => {
      //update issue
      let { _id: idToUpdate, ...valuesToUpdate } = req.body;
      try {
        if (idToUpdate === undefined) {
          return res.json({ error: 'missing _id' });
        }
        if (Object.keys(valuesToUpdate).length === 0) {
          return res.json({ error: 'no update field(s) sent', _id: idToUpdate });
        }
        const findById = await Issues.findById(idToUpdate, '_id', { lean: true });
        valuesToUpdate.updated_on = new Date();
        const updatedIssue = await Issues.findByIdAndUpdate(idToUpdate, valuesToUpdate, {
          returnDocument: 'after',
          lean: true,
          select: '-project -__v'
        });
        //this is needed, must update tests
        //res.json({  result: 'successfully updated', '_id': idToUpdate });
        //not this type of response is needed:
        res.send(updatedIssue);
      } catch (err) {
        res.status(500).json({ error: 'could not update', _id: idToUpdate });
      }
    })
    .delete(function (req, res) {
      //delete issue
      try {
        const project = req.params.project;
      } catch (err) {
        res.status(500).send(err);
      }
    });
};
