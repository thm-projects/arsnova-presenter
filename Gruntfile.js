/* jshint browser: false, node: true */
"use strict";

module.exports = function (grunt) {
	var
		/* The final output directory. */
		outdir = "build/",

		/* A temporary directory used by amdserialize to output the processed
		 * modules. */
		tmpdir = outdir + "tmp/",

		/* The grunt.config property populated by amdserialize, containing the
		 * list of files to include in the layer. */
		outprop = "amdoutput",

		/* The requirejs baseUrl. */
		baseUrl =  "./"
	;

	grunt.initConfig({
		/* The loader config should go here. */
		amdloader: {
			baseUrl: baseUrl,

			/* Enable build of requirejs-text/text */
			inlineText: true,

			/* Here goes the config for the amd plugins build process (has,
			 * i18n, ecma402...). */
			config: {
			},

			packages: [
				{
					name: "arsnova-presenter",
					location: "src"
				},
				{
					name: "dijit",
					location: "bower_components/dijit"
				},
				{
					name: "dojo",
					location: "bower_components/dojo"
				},
				{
					name: "dojox",
					location: "bower_components/dojox"
				},
				{
					name: "dstore",
					location: "bower_components/dstore"
				},
				{
					name: "libarsnova",
					location: "bower_components/libarsnova-js/src"
				},
				{
					name: "dgerhardt",
					location: "bower_components/dgerhardt-dojo"
				}
			]
		},

		/* The common build config */
		amdbuild: {
			/* dir is the output directory. */
			dir: tmpdir,

			/* List of plugins that the build should not try to resolve at build
			 * time. */
			runtimePlugins: ["dojox/gfx/renderer"],

			/* List of layers to build. */
			layers: [{
				name: "arsnova-presenter",
				include: [
					"dojo/_base/window",
					"dojo/request/xhr",
					"dojo/selector/_loader",
					"dojo/selector/lite",
					"dojox/gfx/path",
					"dojox/gfx/svg",

					"arsnova-presenter/controller"
				],
				includeShallow: [
					/* Only the modules listed here (ie. NOT their dependencies)
					 * will be added to the layer. */
				],
				exclude: [
					/* Modules and layers listed here, and their dependencies,
					 * will NOT be in the layer. */
				],
				excludeShallow: [
					/* Only the modules listed here (ie. NOT their dependencies)
					 * will NOT be in the layer. */
				]
			}]
		},

		amdreportjson: {
			dir: outdir
		},

		dojo: {
			dist: {
				options: {
					dojo: tmpdir + "builddeps/dojo/dojo.js",
					profile: "build.prod.profile.js",
					package: ".",
					releaseDir: tmpdir
				}
			}
		},

		/* Erase previous build. */
		clean: {
			build: [outdir],
			tmp: [tmpdir]
		},

		/* Copy the plugin files to the real output directory. */
		copy: {
			plugins: {
				expand: true,
				cwd: tmpdir,
				src: "<%= " + outprop + ".plugins.rel %>",
				dest: outdir,
				dot: true
			},
			dojoreport: {
				expand: true,
				cwd: tmpdir,
				src: "build-report.txt",
				dest: outdir
			}
		},

		symlink: {
			dojo: {
				files: [
					{
						src: "bower_components/dojo",
						dest: tmpdir + "builddeps/dojo"
					},
					{
						src: "node_modules/dojo-util",
						dest: tmpdir + "builddeps/util"
					}
				]
			}
		},

		/* Config to allow uglify to generate the layer. */
		uglify: {
			options: {
				sourceMap: true,
				sourceMapIncludeSources: true
			},
			amd: {
				options: {
					banner: "<%= " + outprop + ".header%>"
				},
				src: "<%= " + outprop + ".modules.abs %>",
				dest: outdir + "presenter.js"
			},
			requirejs: {
				options: {
					banner: "<%= " + outprop + ".header%>"
				},
				src: ["bower_components/requirejs/require.js", "<%= " + outprop + ".modules.abs %>"],
				dest: outdir + "presenter.js"
			},
			dojo: {
				src: tmpdir + "arsnova-presenter/presenter.js",
				dest: outdir + "presenter.js"
			}
		},

		jshint: {
			src: [
				"*.js",
				"src/**/*.js",
				"tests/**/*.js"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		shell: {
			bowerdeps: {
				command: [
					"bower install",
					"bower update"
				].join(";")
			}
		}
	});


	grunt.registerTask("amdbuild", function (amdloader) {
		var
			name = this.name,
			layers = grunt.config(name).layers,
			uglifyTask = grunt.config("amdbuild").includeLoader ? "requirejs" : "amd"
		;

		layers.forEach(function (layer) {
			grunt.task.run("amddepsscan:" + layer.name + ":" + name + ":" + amdloader);
			grunt.task.run("amdserialize:" + layer.name + ":" + name + ":" + amdloader + ":" + outprop);
			grunt.task.run("uglify:" + uglifyTask);
			grunt.task.run("copy:plugins");
		});
	});

	grunt.registerTask("includerequirejs", function () {
		grunt.config("amdbuild.includeLoader", true);
	});

	grunt.registerTask("build", function () {
		grunt.log.writeln("Please use one of the following tasks to build ARSnova Presenter:");
		grunt.log.writeln("* build:dojo         This build includes the Dojo loader [default]");
		grunt.log.writeln("* build:requirejs    This build includes the RequireJS loader");
		grunt.log.writeln("* build:amd          This build includes no loader");
	});

	grunt.loadNpmTasks("grunt-amd-build");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-symlink");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-dojo");
	grunt.loadNpmTasks("grunt-shell");

	grunt.registerTask("build:amd", ["clean", "jshint", "shell:bowerdeps", "amdbuild:amdloader", "amdreportjson:amdbuild", "clean:tmp"]);
	grunt.registerTask("build:requirejs", ["includerequirejs", "build:amd"]);
	grunt.registerTask("build:dojo", ["clean", "jshint", "shell:bowerdeps", "symlink:dojo", "dojo:dist", "uglify:dojo", "copy:dojoreport", "clean:tmp"]);
	grunt.registerTask("default", ["build:dojo"]);
};
