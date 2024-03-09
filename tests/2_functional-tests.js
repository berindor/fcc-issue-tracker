const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const Issues = require('../issue_model.js');

chai.use(chaiHttp);

const testIssues = [
  {
    //[0]
    issue_title: 'Test-title-1',
    issue_text: 'Test-text-1',
    created_by: 'Test-creator-1',
    assigned_to: 'Test-issue-fixer-1',
    status_text: 'Test-status-text-1'
  },
  {
    //[1]
    issue_title: 'Test-title-2',
    issue_text: 'Test-text-2',
    created_by: 'Test-creator-1'
  },
  {
    //[2]
    issue_title: '',
    created_by: 'Test-creator'
  },
  {
    //[3]
    issue_title: 'Test-title-3',
    issue_text: 'Test-text-3',
    created_by: 'Test-creator-2',
    assigned_to: 'Test-issue-fixer-1',
    status_text: 'Test-status-text-1'
  }
];

suite('Functional Tests', async function () {
  test('DELETE /api/delete-testdata deletes all testdata with property {project: "test-project"}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/delete-testdata')
      .end(function (err, res) {
        assert.equal(res.status, 200);
      });
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test-project')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 0);
        done();
      });
  });

  let idOfTestIssue0;

  test('POST /api/issues/{project} creates issue with every field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testIssues[0])
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepInclude(res.body, testIssues[0]);
        assert.include(Object.keys(res.body), '_id');
        assert.include(Object.keys(res.body), 'created_on');
        assert.include(Object.keys(res.body), 'updated_on');
        assert.equal(res.body.open, true);
        assert.isOk(mongoose.Types.ObjectId.isValid(res.body._id));
        idOfTestIssue0 = res.body._id;
        done();
      });
  });
  test('POST /api/issues/{project} creates issue with only required fields', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testIssues[1])
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepInclude(res.body, testIssues[1]);
        assert.include(Object.keys(res.body), '_id');
        assert.include(Object.keys(res.body), 'created_on');
        assert.include(Object.keys(res.body), 'updated_on');
        assert.equal(res.body.open, true);
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isOk(mongoose.Types.ObjectId.isValid(res.body._id));
        done();
      });
  });
  test('POST /api/issues/{project} creates issue with missing required field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testIssues[2])
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  const listOfKeys = ['_id', 'issue_title', 'issue_text', 'created_on', 'updated_on', 'created_by', 'assigned_to', 'status_text', 'open'];

  test('GET /api/issues/{project} returns an array of all issues with all fields', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test-project')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.hasAllKeys(res.body[0], listOfKeys);
        assert.hasAllKeys(res.body[1], listOfKeys);
        assert.deepInclude(res.body[0], testIssues[0]);
        assert.deepInclude(res.body[1], testIssues[1]);
        assert.deepInclude(res.body[1], { assigned_to: '', status_text: '', ...testIssues[1] });
        done();
      });
  });
  let idOfTestIssue3;
  test('GET /api/issues/{project}?key=property returns an array of all issues with one {key: property} filter', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testIssues[3])
      .end(function (err, res) {
        assert.equal(res.status, 200);
      });
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test-project?created_by=Test-creator-2')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.deepInclude(res.body[0], testIssues[3]);
        idOfTestIssue3 = res.body[0]._id;
        done();
      });
  });
  test('GET /api/issues/{project}?key=property returns an array of all issues with multiple {key: property} filters', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test-project?created_by=Test-creator-1&assigned_to=Test-issue-fixer-1')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.deepInclude(res.body[0], testIssues[0]);
        done();
      });
  });
  test('PUT /api/issues/{project} updates one field', function (done) {
    let newIssueObj = { ...testIssues[3] };
    newIssueObj._id = idOfTestIssue3;
    const newText = 'new-issue-text';
    newIssueObj.issue_text = newText;
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ _id: idOfTestIssue3, issue_text: newText })
      .end(async function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: idOfTestIssue3 });
        let updatedIssueInDb = await Issues.findById(idOfTestIssue3, listOfKeys, { lean: true });
        const idString = updatedIssueInDb._id.toString();
        updatedIssueInDb._id = idString;
        assert.deepInclude(updatedIssueInDb, newIssueObj);
        done();
      });
  });
  test('PUT /api/issues/{project} updates multiple fields', function (done) {
    let newIssueObj = { ...testIssues[3] };
    newIssueObj._id = idOfTestIssue3;
    const newText = 'new-issue-text';
    const newFixer = 'new-issue-fixer';
    const newSatus = 'new-status-text';
    newIssueObj.issue_text = newText;
    newIssueObj.assigned_to = newFixer;
    newIssueObj.status_text = newSatus;
    newIssueObj.open = false;
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ _id: idOfTestIssue3, assigned_to: newFixer, status_text: newSatus, open: false })
      .end(async function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: idOfTestIssue3 });
        let updatedIssueInDb = await Issues.findById(idOfTestIssue3, listOfKeys, { lean: true });
        const idString = updatedIssueInDb._id.toString();
        updatedIssueInDb._id = idString;
        assert.deepInclude(updatedIssueInDb, newIssueObj);
        done();
      });
  });
  test('PUT /api/issues/{project} with no fields to update sends error "no update fields sent"', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ _id: idOfTestIssue0 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: idOfTestIssue0 });
        done();
      });
  });
  test('PUT /api/issues/{project} with missing id sends error "missing id"', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ assigned_to: 'new fixer', status_text: 'new text', open: false })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });
  test('PUT /api/issues/{project} with invalid id sends error "could not update"', function (done) {
    const invalidId = 'an invalid id';
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ _id: invalidId, assigned_to: 'new fixer', status_text: 'new text', open: false })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: invalidId });
        done();
      });
  });
  test('PUT /api/issues/{project} with valid id not in db sends error "could not update"', function (done) {
    const invalidId = new mongoose.Types.ObjectId().toString();
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ _id: invalidId, assigned_to: 'new fixer', status_text: 'new text', open: false })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: invalidId });
        done();
      });
  });
  //extra test
  test('PUT /api/issues/{project} with invalid field does not save the invalid field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test-project')
      .send({ _id: idOfTestIssue3, assigned_to: 'new fixer', new_key: 'some value' })
      .end(async function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: idOfTestIssue3 });
        let updatedIssueInDb = await Issues.findById(idOfTestIssue3, {}, { lean: true });
        assert.equal(updatedIssueInDb.assigned_to, 'new fixer');
        assert.equal(updatedIssueInDb.new_key, undefined);
        done();
      });
  });
  test('DEL /api/issues/{project} deletes the issue with given id', function (done) {
    const idToDelete = idOfTestIssue3;
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/test-project')
      .send({ _id: idToDelete })
      .end(async function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully deleted', _id: idToDelete });
        const deletedIssueInDb = await Issues.findById(idToDelete);
        assert.isNotOk(deletedIssueInDb);
        done();
      });
  });
  test('DEL /api/issues/{project} with missing id sends error "missing id"', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/test-project')
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });
  test('DEL /api/issues/{project} with invalid id sends error "could not delete"', function (done) {
    const invalidId = 'an invalid id';
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/test-project')
      .send({ _id: invalidId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', _id: invalidId });
        done();
      });
  });
  test('DEL /api/issues/{project} with valid id not in db sends error "could not delete"', function (done) {
    const invalidId = new mongoose.Types.ObjectId().toString();
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/test-project')
      .send({ _id: invalidId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', _id: invalidId });
        done();
      });
  });
});
