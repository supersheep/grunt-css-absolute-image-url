'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.css_absolute_image_url = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  all: function(test) {

    var actual = grunt.file.read('dest/css/a.css');
    var expected = grunt.file.read('test/expected/all');
    test.equal(actual, expected, 'should describe what the default behavior is.');
    test.ok(true,"passed");

    test.done();
  }
};
