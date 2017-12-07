import http from 'http';
import assert from 'assert';

import '../lib/index.js';

describe('Web Homework 2', () => {
  it('should return 200', done => {
    http.get('http://localhost:3000/', res => {
      assert.equal(200, res.statusCode);
      done();
    });
  });
});
