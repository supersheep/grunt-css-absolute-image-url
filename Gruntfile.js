/*
 * grunt-css-absolute-image-url
 * https://github.com/supersheep/grunt-css-absolute-image-url
 *
 * Copyright (c) 2013 supersheep
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['dest'],
    },

    // Configuration to be run (and then tested).
    css_absolute_image_url: {
      all: {
        options: {
          dir:"test/fixtures",
          root:"public",
          hosts:["i1.cdn.com","i2.cdn.com","i3.cdn.com"], // image host hashes
          no_version:true, // clear ver
          md5:true, // add md5 after 
          allow_image_miss:true
        },
        files: [{expand: true, cwd:"test/fixtures/", src: ['**/*.css'], dest: 'dest/', filter: 'isFile',  ext: '.css'}]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'css_absolute_image_url', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint','test']);

};
