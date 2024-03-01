const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('test POST /api/issues/{project} create issue with every field', function (done) {
    const testValues = {
      issue_title: 'Test-title',
      issue_text: 'Test-text',
      created_by: 'Test-creator',
      assigned_to: 'Test-issue-fixer',
      status_text: 'Test-status-text'
    };
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      //.type('form') //need this?
      //.set('content-type', 'application/x-www-form-urlencoded') //or need this?
      //works withouth them
      .send(testValues)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepInclude(res.body, testValues);
        assert.include(Object.keys(res.body), '_id');
        assert.include(Object.keys(res.body), 'created_on');
        assert.include(Object.keys(res.body), 'updated_on');
        assert.equal(res.body.open, true);
        assert.isOk(mongoose.Types.ObjectId.isValid(res.body._id));
        done();
      });
  });
  test('test POST /api/issues/{project} create issue with only required fields', function (done) {
    const testValues = {
      issue_title: 'Test-title',
      issue_text: 'Test-text',
      created_by: 'Test-creator'
    };
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testValues)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepInclude(res.body, testValues);
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
    const testValues = {
      issue_title: '',
      issue_text: 'Test-text',
      created_by: 'Test-creator'
    };
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test-project')
      .send(testValues)
      .end(function (err, res) {
        assert.equal(res.status, 500);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });
});
