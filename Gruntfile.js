module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '/*! Canvace Game Engine - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					' * http://www.canvace.com/\n' +
					' * Copyright (c) <%= grunt.template.today("yyyy") %> ' +
					'Canvace Srl */\n',

			header: 'var Canvace = (function () {\n' +
					'\t\'use strict\';\n' +
					'\tvar Canvace = {};\n',

			footer: '\treturn Canvace;\n' +
					'}());'
		},

		clean: {
			all: ['bin']
		},

		concat: {
			options: {
				banner: '<%= meta.header %>',
				footer: '<%= meta.footer %>'
			},

			dist: {
				src: ['src/*.js',],
				dest: 'bin/canvace.js'
			}
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
				browser: true,
				globals: {
					Canvace: false
				}
			},

			beforeconcat: {
				files: {
					src: ['src/**.js'],
				}
			},

			afterconcat: {
				files: {
					src: ['<%= concat.dist.dest %>']
				}
			}
		},


		uglify: {
			options: {
				banner: '<%= meta.banner %>',
				report: 'min'
			},

			dist: {
				files: {
					'bin/canvace.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},

		yuidoc: {
			compile: {
				name: 'API reference',
				description: 'Documentation for the Canvace Game Engine',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'src/',
					outdir: 'doc/',
					themedir: 'theme/',
					linkNatives: 'true'
				}
			}
		}
	});

	// Load task handlers
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');

	// Register tasks
	grunt.registerTask('default', ['jshint:beforeconcat', 'concat', 'uglify']);

};
