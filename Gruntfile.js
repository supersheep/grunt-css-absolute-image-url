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
    "css-absolute-image-url": {
      all: {
        options: {
          /**
           * Grunt can only know the files to process,
           * it would not know which is the root directory of your source files
           * so here we tell it, so that the task can replace it with to `root` option
           */
          src:"test/fixtures",
          /**
           * online static file root path
           * this will be used to replace `dir` in the final path
           */
          root:"public", 
          /**
           * image host hashes
           */
          hosts:["i1.cdn.com","i2.cdn.com","i3.cdn.com"], 
          /**
           * whether to clear version
           */
          no_version:true,
          /**
           * whether to add md5 after
           */
          md5:true, 
          allow_image_miss:true
        },
        files:[{
          expand:true,
          src:"**/*.css",
          cwd:"test/fixtures",
          dest:"dest"
        }]
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
  grunt.registerTask('test', ['clean', 'css-absolute-image-url', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint','test']);

};
