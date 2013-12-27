module.exports = function(grunt) {

	///////////////////////////////////////////////////////////////////////////////
	// ENVIRONMENT SETUP
	///////////////////////////////////////////////////////////////////////////////
	// Define variables per environment
	var buildConfig = {
		dev: {
			dest: 'dev',
			jsTasks: ['jshint', 'copy:js'],
			sassOutputStyle: 'expanded'
		},
		release: {
			dest: 'release',
			jsTasks: ['jshint', 'requirejs'],
			sassOutputStyle: 'compressed'
		}
	};

	// Get requested environment
	var buildType = process.argv[2];

	var env;
	if (buildType !== 'dev' && buildType !== 'release') {
		// No environment specified, use dev
		buildType = 'dev';
	}
	env = buildConfig[buildType];
	
	///////////////////////////////////////////////////////////////////////////////
	// DEPENDENCIES & TASK SETUP
	///////////////////////////////////////////////////////////////////////////////
	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
	};

	// JS linting
	gruntConfig.jshint = {
		files: ['gruntfile.js', 'src/js/*.js'],
		options: {
			globals: {
				jQuery: true,
				console: true,
				module: true,
				document: true
			},
			ignores: [
				'src/js/r.js'
			]
		}
	};

	// RequireJS
	gruntConfig.requirejs = {
		compile: {
			options: {
				baseUrl: "src/js",
				mainConfigFile: "src/js/rconfig.js",
				out: env.dest+'/js/<%= pkg.name %>.min.js'
			}
		}
	};

	// Jade => HTML
	gruntConfig.jade = {
		compile: {
			options: {
				pretty: true,
				data: {
					env: buildType,
					pkg: {
						name: '<%= pkg.name %>'
					}
				}
			},
			files:  [
				{
					expand: true,
					cwd: 'src/jade',
					dest: env.dest,
					src: ['*.jade'],
					ext: '.html'
				}
			],
		}
	};

	// SASS => CSS
	gruntConfig.compass = {
		dist: {
			options: {
				require: [
					'sass-globbing'
				],
				imagesDir: 'src/img',
				sassDir: 'src/sass',
				cssDir: env.dest+'/stylesheets',
				outputStyle: env.sassOutputStyle,
				relativeAssets: false
			}
		}
	};

	// Asset copying
	gruntConfig.copy = {
		img: {
			files: [
				{expand: true, cwd: 'src/img', src: ['**'], dest: env.dest+'/img', filter: 'isFile'}
			]
		},
		content: {
			files: [
				{expand: true, cwd: 'src/content', src: ['**'], dest: env.dest+'/content'},
			]
		},
		video: {
			files: [
				{expand: true, cwd: 'src/video', src: ['**'], dest: env.dest+'/video'}
			]					
		},
		js: {
			files: [
				{expand: true, cwd: 'src/js', src: ['**'], dest: env.dest+'/js'}
			]
		}
	};

	// Task watching
	gruntConfig.watch = {
		js: {
			files: ['src/js/**'],
			tasks: ['js'],
			options: {
				interrupt: true
			}
		},
		scss: {
			files: ['src/sass/**'],
			tasks: ['sass'],
			options: {
				interrupt: true
			}
		},
		jade: {
			files: ['src/jade/**'],
			tasks: ['jade'],
			options: {
				interrupt: true
			}
		},
		img: {
			files: ['src/img/**'],
			tasks: ['copy:img'],
			options: {
				interrupt: true
			},
		},
		video: {
			files: ['src/video/**'],
			tasks: ['copy:video'],
			options: {
				interrupt: true
			},
		},
		content: {
			files: ['src/content/**'],
			tasks: ['copy:content'],
			options: {
				interrupt: true
			},
		}
	};

	// Pass above config to Grunt
	grunt.initConfig(gruntConfig);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	// Set up task aliases
	grunt.registerTask('js', env.jsTasks); // Get JS tasks from environment (e.g. only run concat or uglify in release)
	grunt.registerTask('default', ['jshint', 'jade', 'js', 'copy:img', 'copy:video', 'copy:content', 'compass']);
	
	grunt.registerTask('sass', ['compass']);
	
	// Define dummy tasks to allow  CLI to pass environment
	grunt.registerTask('dev', ['default', 'watch']);
	grunt.registerTask('release', ['default']);

};