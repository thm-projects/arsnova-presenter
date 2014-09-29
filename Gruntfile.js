/* jshint browser: false, node: true */
"use strict";

module.exports = function (grunt) {
	var
		/* The NPM package file is used for version info */
		pkg = require("./package.json"),

		/* The final output directory. */
		outdir = "build/",

		/* A temporary directory used by amdserialize to output the processed
		 * modules. */
		tmpdir = outdir + "tmp/",

		/* The grunt.config property populated by amdserialize, containing the
		 * list of files to include in the layer. */
		outprop = "amdoutput",

		/* The requirejs baseUrl. */
		baseUrl =  "./",

		versionFilePath = tmpdir + "version/"
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
				},
				{
					name: "version",
					location: versionFilePath,
					main: "version"
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
			options: {
				dojo: tmpdir + "builddeps/dojo/dojo.js",
				package: ".",
				releaseDir: tmpdir
			},
			prod: {
				options: {
					profile: "build.prod.profile.js"
				}
			},
			dev: {
				options: {
					profile: "build.dev.profile.js"
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
			},
			resources: {
				files: [{
					expand: true,
					cwd: tmpdir + "arsnova-presenter",
					src: ["resources/**"],
					dest: outdir
				}]
			},
			prodresources: {
				files: [{
					expand: true,
					cwd: tmpdir + "arsnova-presenter",
					src: ["nls/**"],
					dest: outdir
				}, {
					expand: true,
					cwd: tmpdir,
					src: "dojo/resources/**",
					dest: outdir + "lib"
				}, {
					expand: true,
					cwd: tmpdir,
					src: "dijit/themes/claro/**/*.{css,png}",
					dest: outdir + "lib"
				}]
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
			},
			lib: {
				files: [{
					expand: true,
					cwd: "bower_components/MathJax",
					src: ["MathJax.js", "config/Safe.js", "config/TeX-AMS_HTML.js", "extensions", "fonts/HTML-CSS/TeX/*", "!fonts/HTML-CSS/TeX/png", "images", "jax/element", "jax/input/TeX", "jax/output/HTML-CSS", "jax/output/NativeMML", "jax/output/SVG/*", "!jax/output/SVG/fonts", "jax/output/SVG/fonts/TeX", "localization/de", "localization/en"],
					dest: outdir + "lib/mathjax"
				}]
			},
			devlib: {
				files: [{
					expand: true,
					cwd: "bower_components",
					src: ["*", "!MathJax", "!qrcode-generator", "!socket.io-client"],
					dest: outdir + "lib"
				}, {
					src: "src",
					dest: outdir + "lib/arsnova-presenter"
				}]
			}
		},

		/* Config to allow uglify to generate the layer. */
		uglify: {
			options: {
				/* jshint ignore: start */
				compress: {
					drop_console: true
				},
				/* jshint ignore: end */
				sourceMap: true,
				sourceMapIncludeSources: true
			},
			amd: {
				options: {
					banner: "<%= " + outprop + ".header%>"
				},
				src: ["src/config.js", "<%= " + outprop + ".modules.abs %>", "src/bootstrap.js"],
				dest: outdir + "presenter.js"
			},
			requirejs: {
				options: {
					banner: "<%= " + outprop + ".header%>"
				},
				src: ["bower_components/requirejs/require.js", "src/config.js", "<%= " + outprop + ".modules.abs %>", "src/bootstrap.js"],
				dest: outdir + "presenter.js"
			},
			dojo: {
				src: [tmpdir + "arsnova-presenter/config.js", tmpdir + "arsnova-presenter/presenter.js", tmpdir + "arsnova-presenter/bootstrap.js"],
				dest: outdir + "presenter.js"
			},
			lib: {
				files: [{
					src: "bower_components/socket.io-client/socket.io.js",
					dest: outdir + "lib/socket.io-client/socket.io.js"
				}, {
					src: "bower_components/qrcode-generator/js/qrcode.js",
					dest: outdir + "lib/qrcode-generator/qrcode.js"
				}]
			}
		},

		less: {
			dist: {
				options: {
					paths: ["src/less"],
					cleancss: true
				},
				files: [{
					src: "src/less/loader.less",
					dest: tmpdir + "arsnova-presenter/resources/css/loader.css"
				}]
			}
		},

		inline: {
			options: {
				inlineTagAttributes: "data-inline"
			},
			dist: {
				src: tmpdir + "arsnova-presenter/index.html",
				dest: outdir + "index.html"
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
		},

		war: {
			dist: {
				/* jshint ignore: start */
				options: {
					war_dist_folder: outdir,
					war_name: "arsnova-presenter",
					webxml_display_name: "ARSnova Presenter"
				},
				/* jshint ignore: end */
				files: [{
					expand: true,
					cwd: outdir,
					src: ["**", "!**/*.map", "!build-report.txt", "!tmp/**"],
					dest: outdir
				}]
			}
		},

		connect: {
			server: {
				options: {
					base: outdir,
					port: 8081,
					useAvailablePort: true
				}
			}
		}
	});


	grunt.registerTask("amdbuild", function (amdloader, includeLoader) {
		var
			name = this.name,
			layers = grunt.config(name).layers,
			uglifyTask = "includeloader" === includeLoader ? "requirejs" : "amd"
		;

		layers.forEach(function (layer) {
			grunt.task.run("amddepsscan:" + layer.name + ":" + name + ":" + amdloader);
			grunt.task.run("amdserialize:" + layer.name + ":" + name + ":" + amdloader + ":" + outprop);
			grunt.task.run("uglify:" + uglifyTask);
			grunt.task.run("copy:plugins");
		});
	});

	grunt.registerTask("build", function (target, env) {
		if (!target) {
			target = "dojo";
		}
		if (-1 === ["prod", "dev"].indexOf(env)) {
			env = "prod";
		}

		var taskList;
		switch (target) {
		case "amd":
			taskList = ["amdbuild:amdloader", "amdreportjson:amdbuild"];

			break;
		case "requirejs":
			taskList = ["amdbuild:amdloader:includeloader", "amdreportjson:amdbuild"];

			break;
		case "dojo":
			taskList = ["symlink:dojo", "dojo:" + env, "uglify:dojo", "less:dist", "inline", "copy:dojoreport", "copy:resources", "uglify:lib", "symlink:lib"];
			if ("dev" === env) {
				taskList.push("symlink:devlib");
			} else {
				taskList.push("copy:prodresources");
			}

			break;
		default:
			grunt.log.writeln("Please use one of the following tasks to build ARSnova Presenter:");
			grunt.log.writeln("* build:dojo         This build includes the Dojo loader [default]");
			grunt.log.writeln("* build:requirejs    This build includes the RequireJS loader");
			grunt.log.writeln("* build:amd          This build includes no loader");

			return;
		}
		grunt.task.run(["clean", "jshint", "shell:bowerdeps", "genversionfile"]);
		grunt.task.run(taskList);
		grunt.task.run("clean:tmp");
	});

	grunt.registerTask("genversionfile", function () {
		var
			done = this.async(),
			generate = function (dirty) {
				grunt.util.spawn({
					cmd: "git",
					args: ["log", "-n", "1", "--pretty=format:%h"]
				}, function (error, result, code) {
					var version = {
						version: pkg.version,
						commitId: result.stdout,
						dirty: dirty,
						buildTime: (new Date()).toISOString(),
						buildNumber: 0
					};
					grunt.file.write(versionFilePath + "version.js", "define(" + JSON.stringify(version) + ");\n");
					done(true);
				});
			}
		;
		grunt.util.spawn({
			cmd: "git",
			args: ["status", "--porcelain"]
		}, function (error, result, code) {
			var dirty = false;
			result.stdout.split("\n").forEach(function (line) {
				if (!/^\?\?/.test(line)) {
					dirty = true;

					return;
				}
			});
			generate(dirty);
		});
	});

	grunt.loadNpmTasks("grunt-amd-build");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-symlink");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-dojo");
	grunt.loadNpmTasks("grunt-inline");
	grunt.loadNpmTasks("grunt-shell");
	grunt.loadNpmTasks("grunt-war");

	grunt.registerTask("default", ["build"]);
	grunt.registerTask("dev", ["build:dojo:dev"]);
	grunt.registerTask("run", ["connect:server:keepalive"]);
};
