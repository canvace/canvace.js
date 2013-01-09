/*global module:false*/
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.2.5',
      banner: '/*! Canvace Client Library - v<%= meta.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
              '* http://www.canvace.com/\n' +
              '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
              'Canvace Srl */',
      header: 'var Canvace = (function () {\n' +
              '"use strict";\n' +
              'var Canvace = {};\n',
      footer: 'return Canvace;\n' +
              '}());'
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<banner:meta.header>',
          '<file_strip_banner:Polyfill.js>',
          '<file_strip_banner:MultiSet.js>',
          '<file_strip_banner:List.js>',
          '<file_strip_banner:Heap.js>',
          '<file_strip_banner:StateMachine.js>',
          '<file_strip_banner:ParametricStateMachine.js>',
          '<file_strip_banner:Astar.js>',
          '<file_strip_banner:Mobile.js>',
          '<file_strip_banner:Keyboard.js>',
          '<file_strip_banner:Mouse.js>',
          '<file_strip_banner:Loader.js>',
          '<file_strip_banner:View.js>',
          '<file_strip_banner:FrameTable.js>',
          '<file_strip_banner:Buckets.js>',
          '<file_strip_banner:Renderer.js>',
          '<file_strip_banner:TileMap.js>',
          '<file_strip_banner:Stage.js>',
          '<file_strip_banner:StageRenderer.js>',
          '<file_strip_banner:RumbleEffect.js>',
          '<file_strip_banner:RenderLoop.js>',
          '<file_strip_banner:Audio.js>',
          '<file_strip_banner:Visibility.js>',
          '<banner:meta.footer>'
        ],
        dest: 'canvace.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>',
              '<config:concat.dist.dest>'],
        dest: 'canvace.min.js'
      }
    },
    lint: {
        beforeconcat: [
          'Polyfill.js',
          'MultiSet.js',
          'List.js',
          'Heap.js',
          'StateMachine.js',
          'ParametricStateMachine.js',
          'Astar.js',
          'Mobile.js',
          'Keyboard.js',
          'Mouse.js',
          'Loader.js',
          'View.js',
          'FrameTable.js',
          'Buckets.js',
          'Renderer.js',
          'TileMap.js',
          'Stage.js',
          'StageRenderer.js',
          'RumbleEffect.js',
          'RenderLoop.js',
          'Audio.js',
          'Visibility.js',
        ],
        afterconcat: '<config:concat.dist.dest>'
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        Canvace: true
      }
    },
  });

  // Default task.
  grunt.registerTask('default', 'lint:beforeconcat concat min lint:afterconcat');

};
