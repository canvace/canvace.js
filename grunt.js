/*global module:false*/
module.exports = function (grunt) {
	grunt.initConfig({
		meta: {
			version: '0.2.6',
			banner: '/*! Canvace Client Library - v<%= meta.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'* http://www.canvace.com/\n' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
					'Canvace Srl */',
			header: 'var Canvace = (function () {\n' +
					'\t\'use strict\';\n' +
					'\tvar Canvace = {};\n',
			footer: '\treturn Canvace;\n' +
					'}());'
		},
		concat: {
			dist: {
				src: [
					'<banner:meta.banner>',
					'<banner:meta.header>',
					'<file_strip_banner:src/Polyfill.js>',
					'<file_strip_banner:src/Timing.js>',
					'<file_strip_banner:src/MultiSet.js>',
					'<file_strip_banner:src/List.js>',
					'<file_strip_banner:src/Heap.js>',
					'<file_strip_banner:src/Ajax.js>',
					'<file_strip_banner:src/StateMachine.js>',
					'<file_strip_banner:src/ParametricStateMachine.js>',
					'<file_strip_banner:src/Astar.js>',
					'<file_strip_banner:src/Mobile.js>',
					'<file_strip_banner:src/Keyboard.js>',
					'<file_strip_banner:src/Mouse.js>',
					'<file_strip_banner:src/Loader.js>',
					'<file_strip_banner:src/View.js>',
					'<file_strip_banner:src/FrameTable.js>',
					'<file_strip_banner:src/Buckets.js>',
					'<file_strip_banner:src/Renderer.js>',
					'<file_strip_banner:src/TileMap.js>',
					'<file_strip_banner:src/Stage.js>',
					'<file_strip_banner:src/StageRenderer.js>',
					'<file_strip_banner:src/DebugEffect.js>',
					'<file_strip_banner:src/RumbleEffect.js>',
					'<file_strip_banner:src/RenderLoop.js>',
					'<file_strip_banner:src/Animator.js>',
					'<file_strip_banner:src/Audio.js>',
					'<file_strip_banner:src/Visibility.js>',
					'<banner:meta.footer>'
				],
				dest: 'bin/canvace.js'
			}
		},
		min: {
			dist: {
				src: [
					'<banner:meta.banner>',
					'<config:concat.dist.dest>'
				],
				dest: 'bin/canvace.min.js'
			}
		},
		lint: {
				beforeconcat: [
					'src/Ajax.js',
					'src/Animator.js',
					'src/Astar.js',
					'src/Audio.js',
					'src/Buckets.js',
					'src/DebugEffect.js',
					'src/FrameTable.js',
					'src/Heap.js',
					'src/Keyboard.js',
					'src/List.js',
					'src/Loader.js',
					'src/Mobile.js',
					'src/Mouse.js',
					'src/MultiSet.js',
					'src/ParametricStateMachine.js',
					'src/Polyfill.js',
					'src/Renderer.js',
					'src/RenderLoop.js',
					'src/RumbleEffect.js',
					'src/Stage.js',
					'src/StageRenderer.js',
					'src/StateMachine.js',
					'src/TileMap.js',
					'src/Timing.js',
					'src/View.js',
					'src/Visibility.js',
				],
				afterconcat: '<config:concat.dist.dest>'
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint qunit'
		},
		jshint: {
			options: {
				camelcase: true,
				curly: true,
				immed: true,
				indent: 4,
				latedef: true,
				newcap: true,
				noarg: true,
				quotmark: 'single',
				undef: true,
				unused: true,
				strict: false,
				trailing: true,
				boss: true,
				debug: true,
				expr: true,
				loopfunc: true,
				multistr: true,
				smarttabs: true,
				supernew: true,
				browser: true
			},
			globals: {
				Canvace: true
			}
		},
	});
	grunt.registerTask('default', 'lint:beforeconcat concat min');
};
