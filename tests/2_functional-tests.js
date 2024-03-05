const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

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
    issue_text: 'Test-text',
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

suite('Functional Tests', function () {
  test('delete all testdata with property {project: "test-project"}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/delete-testdata')
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

  test('test POST /api/issues/{project} create issue with every field', function (done) {
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
        done();
      });
  });
  test('test POST /api/issues/{project} create issue with only required fields', function (done) {
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
  test('test POST /api/issues/{project} create issue with missing required field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testIssues[2])
      .end(function (err, res) {
        assert.equal(res.status, 500);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });
  test('test GET /api/issues/{project} return an array of all issues with all fields', function (done) {
    const listOfKeys = ['_id', 'issue_title', 'issue_text', 'created_on', 'updated_on', 'created_by', 'assigned_to', 'status_text', 'open'];
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
  test('test GET /api/issues/{project}?key=property return an array of all issues with one {key: property} filter', function (done) {
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
      });
    done();
  });
  test('test GET /api/issues/{project}?key=property return an array of all issues with multiple {key: property} filters', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test-project?created_by=Test-creator-1&assigned_to=Test-issue-fixer-1')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.deepInclude(res.body[0], testIssues[0]);
      });
    done();
  });
});
