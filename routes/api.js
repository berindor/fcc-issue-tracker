'use strict';
const Issues = require('../issue_model.js');

module.exports = function (app) {
  //delete all documents of test-project
  app.delete('/api/delete-testdata', async (req, res) => {
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
        //something is wrong here
        res.status(200).send({ error: 'required field(s) missing' });
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
        valuesToUpdate.updated_on = new Date();
        await Issues.findByIdAndUpdate(idToUpdate, valuesToUpdate, {
          returnDocument: 'after',
          lean: true,
          select: '-project -__v'
        });
        res.json({ result: 'successfully updated', _id: idToUpdate });
      } catch (err) {
        //something is wrong here: {result, _id} érkezik valahol, ahol {error, _id}kellene
        res.status(200).send({ error: 'could not update', _id: idToUpdate });
      }
    })
    .delete(async function (req, res) {
      //delete issue
      const { _id: idToDelete } = req.body;
      try {
        if (idToDelete === undefined) {
          return res.json({ error: 'missing _id' });
        }
        await Issues.findByIdAndDelete(idToDelete);
        res.json({ result: 'successfully deleted', _id: idToDelete });
      } catch (err) {
        //something is wrong here: {result, _id} érkezik valahol, ahol {error, _id}kellene
        res.status(200).send({ error: 'could not delete', _id: idToDelete });
      }
    });
};
